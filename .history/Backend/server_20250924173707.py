from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from models import create_microservice, list_microservices, update_microservice, delete_microservice
import subprocess
import uuid

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Cargar el URL base y el token desde las variables de entorno
ROBLE_AUTH_URL = os.getenv("ROBLE_AUTH_URL")
ROBLE_API_TOKEN = os.getenv("ROBLE_API_TOKEN")

app = Flask(__name__)

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

@app.route('/microservices', methods=['POST'])
def add_microservice():
    """Crea un nuevo microservicio y lanza su contenedor."""
    data = request.json
    name = data.get("name")
    endpoint = data.get("endpoint")
    processing_type = data.get("processing_type")
    code = data.get("code")  # Recibe el bloque de código Python

    if not name or not endpoint or not processing_type or not code:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # Guarda el microservicio en memoria
    microservice = create_microservice(name, endpoint, processing_type, code)

    # Genera un directorio único para el microservicio
    ms_id = microservice["id"]
    ms_dir = f"microservice_{ms_id}_{uuid.uuid4().hex[:8]}"
    os.makedirs(ms_dir, exist_ok=True)

    # Guarda el código Python en el directorio
    main_py_path = os.path.join(ms_dir, "main.py")
    with open(main_py_path, "w", encoding="utf-8") as f:
        f.write(code)

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
    image_name = f"microservice_{ms_id}".lower()
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

@app.route('/microservices/<int:microservice_id>', methods=['DELETE'])
def remove_microservice(microservice_id):
    """Elimina un microservicio."""
    delete_microservice(microservice_id)
    return jsonify({"message": "Microservicio eliminado"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)