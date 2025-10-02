from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from models import create_microservice, list_microservices, update_microservice, delete_microservice
import subprocess
import uuid
import tempfile
from flask_cors import CORS
# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Cargar el URL base y el token desde las variables de entorno
ROBLE_AUTH_URL = os.getenv("ROBLE_AUTH_URL")
ROBLE_API_TOKEN = os.getenv("ROBLE_API_TOKEN")

app = Flask(__name__)
CORS(app)

def login_user(email, password):
    """Realiza el login del usuario y obtiene el accessToken y refreshToken."""
    headers = {"Authorization": f"Bearer {ROBLE_API_TOKEN}"}
    try:
        response = requests.post(f"{ROBLE_AUTH_URL}/login", json={
            "email": email,
            "password": password
        }, headers=headers)
        print("Respuesta de Roble:", response.status_code, response.text)  # Depuración
        response.raise_for_status()  # Lanza una excepción si el código de estado no es 2xx
        return response.json()
    except requests.exceptions.RequestException as e:
        print("Error al realizar la solicitud:", e)
        raise Exception("Error al autenticar con Roble")

def validate_token(token):
    """Valida un token con el sistema Roble."""
    headers = {
        "Authorization": f"Bearer {ROBLE_API_TOKEN}",  # Token del proyecto
        "User-Token": f"Bearer {token}"  # Token del usuario
    }
    response = requests.get(f"{ROBLE_AUTH_URL}/verify-token", headers=headers)
    if response.status_code == 200:
        return response.json()  # Token válido, retorna datos del usuario
    elif response.status_code == 401:
        raise ValueError("Token inválido o expirado")
    else:
        raise Exception("Error al validar el token con Roble")
    
@app.route('/login', methods=['POST'])
def login():
    """Endpoint para autenticar usuarios."""
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400
    try:
        tokens = login_user(email, password)
        return jsonify(tokens), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/validate', methods=['GET'])
def validate():
    """Endpoint para validar un token."""
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token no proporcionado"}), 400
    try:
        token_data = validate_token(token.split(" ")[1])  # Extrae el token después de "Bearer"
        return jsonify(token_data), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/microservices', methods=['GET'])
def get_microservices():
    """Devuelve la lista de microservicios activos en Docker."""
    try:
        result = subprocess.run(
            ["docker", "ps", "--format", "{{.ID}}|{{.Image}}|{{.Names}}|{{.Status}}|{{.Ports}}"],
            capture_output=True,
            text=True,
            timeout=5
        )
        containers = []
        for line in result.stdout.strip().split('\n'):
            if line:
                cid, image, name, status, ports = line.split('|')
                containers.append({
                    "container_id": cid,
                    "image": image,
                    "name": name,
                    "status": status,
                    "ports": ports
                })
        return jsonify(containers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/microservices', methods=['POST'])
def add_microservice():
    data = request.json
    name = data.get("name")
    endpoint = data.get("endpoint")
    processing_type = data.get("processing_type")
    code = data.get("code")
    nombre_funcion = "main"

    if not name or not endpoint or not processing_type or not code:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # Guarda el microservicio en memoria
    microservice = create_microservice(name, endpoint, processing_type, code)

    # Genera un directorio único para el microservicio
    ms_id = microservice["id"]
    ms_dir = f"microservice_{ms_id}_{uuid.uuid4().hex[:8]}"
    os.makedirs(ms_dir, exist_ok=True)

    # Genera el código Flask automáticamente
    flask_code = generar_codigo_flask(nombre_funcion, code)

    # Guarda el código Flask en el directorio
    main_py_path = os.path.join(ms_dir, "main.py")
    with open(main_py_path, "w", encoding="utf-8") as f:
        f.write(flask_code)

    # Genera un Dockerfile básico
    dockerfile_content = f"""
FROM python:3.9-slim
WORKDIR /app
COPY main.py /app/main.py
RUN pip install flask
EXPOSE 8000
CMD ["python", "main.py"]
"""
    dockerfile_path = os.path.join(ms_dir, "Dockerfile")
    with open(dockerfile_path, "w", encoding="utf-8") as f:
        f.write(dockerfile_content)

    # Construye la imagen Docker
    image_name = name.lower().replace(" ", "_")  # Usa el nombre personalizado
    build_cmd = ["docker", "build", "-t", image_name, ms_dir]
    try:
        subprocess.run(build_cmd, check=True)
    except Exception as e:
        return jsonify({"error": f"Error al construir la imagen Docker: {e}"}), 500

    # Lanza el contenedor
    run_cmd = ["docker", "run", "-d", "-p", f"{8000+ms_id}:8000", "--name", image_name, image_name]
    try:
        subprocess.run(run_cmd, check=True)
    except Exception as e:
        return jsonify({"error": f"Error al lanzar el contenedor: {e}"}), 500

    return jsonify(microservice), 201

@app.route('/microservices/<int:microservice_id>', methods=['PUT'])
def edit_microservice(microservice_id):
    """Edita un microservicio existente."""
    data = request.json
    name = data.get("name")
    endpoint = data.get("endpoint")
    processing_type = data.get("processing_type")
    microservice = update_microservice(microservice_id, name, endpoint, processing_type)
    if not microservice:
        return jsonify({"error": "Microservicio no encontrado"}), 404
    return jsonify(microservice), 200

@app.route('/microservices/<int:ms_id>', methods=['DELETE'])
def delete_microservice(ms_id):
    # Elimina el microservicio de la base de datos/lista
    delete_microservice(ms_id)
    # Elimina el contenedor Docker
    image_name = f"microservice_{ms_id}".lower()
    try:
        subprocess.run(["docker", "rm", "-f", image_name], check=True)
        subprocess.run(["docker", "rmi", image_name], check=True)
    except Exception as e:
        return jsonify({"error": f"Error al eliminar el contenedor Docker: {e}"}), 500
    return jsonify({"success": True})

@app.route('/proxy/<int:microservice_id>/<path:endpoint>', methods=['GET', 'POST'])
def proxy_to_microservice(microservice_id, endpoint):
    """Proxy que redirige la petición al microservicio correspondiente."""
    port = 8000 + microservice_id
    url = f"http://localhost:{port}/{endpoint}"

    try:
        if request.method == 'GET':
            resp = requests.get(url, params=request.args)
        else:
            resp = requests.post(url, json=request.get_json())
        return (resp.content, resp.status_code, resp.headers.items())
    except Exception as e:
        return jsonify({"error": f"Error al conectar con el microservicio: {e}"}), 500
@app.route('/test-code', methods=['POST'])
def test_code():
    """
    Recibe código Python, lo ejecuta y devuelve la salida.
    """
    data = request.json
    code = data.get("code")
    if not code:
        return jsonify({"error": "No se recibió código"}), 400

    # Guarda el código en un archivo temporal
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as tmp:
        tmp.write(code)
        tmp_path = tmp.name

    try:
        # Ejecuta el archivo con timeout de 5 segundos
        result = subprocess.run(
            ["python", tmp_path],
            capture_output=True,
            text=True,
            timeout=5
        )
        output = result.stdout
        error = result.stderr
    except subprocess.TimeoutExpired:
        output = ""
        error = "Tiempo de ejecución excedido (timeout)"
    except Exception as e:
        output = ""
        error = str(e)
    finally:
        # Elimina el archivo temporal
        os.remove(tmp_path)

    return jsonify({
        "output": output,
        "error": error
    }), 200
def generar_codigo_flask(nombre_funcion, codigo_usuario):
    """
    Inserta el código del usuario en una plantilla Flask.
    """
    return f'''
from flask import Flask, request, jsonify

app = Flask(__name__)

{codigo_usuario}

@app.route('/process', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        data = request.get_json()
    else:
        data = request.args
    resultado = main(data)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
'''
@app.route(f'/{endpoint}', methods=['POST'])
def process():
    data = request.get_json()
    resultado = main(data)
    return jsonify(resultado)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)