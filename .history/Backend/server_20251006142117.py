from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from models import create_and_persist_microservice, delete_microservice_by_id, load_microservices, save_microservices, validate_token, login_user, update_microservice
import os
import subprocess
from datetime import datetime
import re
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
# ...código existente...
@app.route('/microservices', methods=['GET'])
def get_microservices():
    microservices = load_microservices()
    for ms in microservices:
        # 1. Verifica si el contenedor existe
        inspect_proc = subprocess.run(
            ["docker", "inspect", ms["id"]],
            capture_output=True, text=True
        )
        if inspect_proc.returncode != 0:
            # El contenedor no existe, así que créalo de nuevo
            # Debes tener el Dockerfile y el código fuente en la carpeta del historial
            folder_path = os.path.join("historial", ms["folder_name"])
            if os.path.exists(folder_path):
                # Construye la imagen si no existe
                subprocess.run([
                    "docker", "build", "-t", ms["image_name"], folder_path
                ], check=True)
                # Crea el contenedor
                run_proc = subprocess.run([
                    "docker", "run", "-d", "-p", f"{ms['port']}:8000", "--name", ms["image_name"], ms["image_name"]
                ], capture_output=True, text=True)
                # Actualiza el ID del contenedor si es necesario
                if run_proc.returncode == 0:
                    new_id = run_proc.stdout.strip()
                    ms["id"] = new_id
                    save_microservices(microservices)
        # ...código existente para actualizar estado y puerto...
        ps_cmd = [
            "docker", "ps", "--filter", f"id={ms['id']}",
            "--format", "{{.Status}}"
        ]
        status_result = subprocess.run(ps_cmd, capture_output=True, text=True)
        ms["status"] = status_result.stdout.strip() or "stopped"
        if ms["status"] == "stopped":
            subprocess.run(["docker", "start", ms["id"]], check=False)
            ps_cmd = [
                "docker", "ps", "--filter", f"id={ms['id']}",
                "--format", "{{.Status}}"
            ]
            status_result = subprocess.run(ps_cmd, capture_output=True, text=True)
            ms["status"] = status_result.stdout.strip() or "stopped"
        inspect_cmd = [
            "docker", "inspect",
            "--format", "{{(index (index .NetworkSettings.Ports \"8000/tcp\") 0).HostPort}}",
            ms["id"]
        ]
        port_result = subprocess.run(inspect_cmd, capture_output=True, text=True)
        ms["port"] = port_result.stdout.strip() or ms.get("port")
    return jsonify({"microservices": microservices}), 200
# ...código existente...
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
        # Elimina del JSON y la carpeta física
        delete_microservice_by_id(container_id)
    except Exception as e:
        return jsonify({"error": f"Error al eliminar el contenedor Docker: {e}"}), 500

    return jsonify({"success": True}), 200

# PUT -> EDITAR MICROSERVICIO
@app.route('/microservices/<string:container_id>', methods=['PUT'])
def edit_microservice(container_id):
    data = request.json
    name = data.get("name")
    endpoint = data.get("endpoint")
    processing_type = data.get("processing_type")
    code = data.get("code")
    microservice = update_microservice(container_id, name, processing_type, endpoint, code)
    if not microservice:
        return jsonify({"error": "Microservicio no encontrado"}), 404
    save_microservices(load_microservices())
    return jsonify(microservice), 200
#TEST CODE
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
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as tmp:
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)