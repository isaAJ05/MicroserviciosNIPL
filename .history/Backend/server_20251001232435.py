from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from models import create_and_persist_microservice, load_microservices, save_microservices, delete_microservice_by_id, update_microservice

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
#ENDPOINTS MICROSERVICIOS
#POST -> CREAR MICROSERVICIO
@app.route('/microservices', methods=['POST'])
def add_microservice():
    data = request.json
    name = data.get("name")
    endpoint = data.get("endpoint")
    processing_type = data.get("processing_type")
    code = data.get("code")

    if not name or not endpoint or not processing_type or not code:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    try:
        microservice = create_and_persist_microservice(name, processing_type, endpoint, code)
    except Exception as e:
        return jsonify({"error": f"Error al crear el microservicio: {e}"}), 500

    return jsonify(microservice), 201
# GET -> LISTAR MICROSERVICIOS
@app.route('/microservices', methods=['GET'])
def get_microservices():
    microservices = load_microservices()
    # Actualiza estado y puerto desde Docker
    for ms in microservices:
        # Estado
        ps_cmd = [
            "docker", "ps", "--filter", f"id={ms['id']}",
            "--format", "{{.Status}}"
        ]
        status_result = subprocess.run(ps_cmd, capture_output=True, text=True)
        ms["status"] = status_result.stdout.strip() or "stopped"
        # Puerto
        inspect_cmd = [
            "docker", "inspect",
            "--format", "{{(index (index .NetworkSettings.Ports \"8000/tcp\") 0).HostPort}}",
            ms["id"]
        ]
        port_result = subprocess.run(inspect_cmd, capture_output=True, text=True)
        ms["port"] = port_result.stdout.strip() or ms.get("port")
    return jsonify({"microservices": microservices}), 200
# DELETE -> ELIMINAR MICROSERVICIO
@app.route('/microservices/<string:container_id>', methods=['DELETE'])
def delete_microservice(container_id):
    microservices = load_microservices()
    ms = next((m for m in microservices if m["id"] == container_id), None)
    if not ms:
        return jsonify({"error": "Microservicio no encontrado"}), 404

    image_name = ms["image_name"]
    try:
        subprocess.run(["docker", "rm", "-f", container_id], check=True)
        subprocess.run(["docker", "rmi", image_name], check=True)
    except Exception as e:
        return jsonify({"error": f"Error al eliminar el contenedor Docker: {e}"}), 500

    delete_microservice_by_id(container_id)
    return jsonify({"success": True})

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
def generar_codigo_flask(nombre_funcion, codigo_usuario, endpoint):
    """
    Inserta el código del usuario en una plantilla Flask.
    """
    return f'''
from flask import Flask, request, jsonify

app = Flask(__name__)

{codigo_usuario}

@app.route('/{endpoint}', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        data = request.get_json()
    else:
        data = request.args
    resultado = {nombre_funcion}(data)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
'''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)