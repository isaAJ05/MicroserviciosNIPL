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
    """Devuelve la lista de microservicios."""
    return jsonify(list_microservices()), 200


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

@app.route('/microservices/<int:microservice_id>', methods=['DELETE'])
def remove_microservice(microservice_id):
    """Elimina un microservicio."""
    delete_microservice(microservice_id)
    return jsonify({"message": "Microservicio eliminado"}), 200

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

@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    resultado = {nombre_funcion}(data)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
'''
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)