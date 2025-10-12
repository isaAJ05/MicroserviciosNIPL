from flask import Flask, request, jsonify
import docker
import requests
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from models import create_and_persist_microservice, delete_microservice_by_id, load_microservices, save_microservices, update_microservice
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
ROBLE_EMAIL = os.getenv("email")
ROBLE_PASSWORD = os.getenv("password")

app = Flask(__name__)
CORS(app)

# VERIFICACIÓN DE DOCKER
@app.route('/is_docker_active')
def is_docker_active():
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            text=True,
            timeout=3
        )
        return jsonify({"active": result.returncode == 0})
    except Exception:
        return jsonify({"active": False})

#ENDPOINTS ROBLE
#LOGIN USUARIO - Devuelve token JWT
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    token_contract = data.get('token_contract')
    # Si el usuario es 'invitado' o vacío, usar credenciales del .env
    if not email or email.strip().lower() == 'invitado':
        email = ROBLE_EMAIL
        password = ROBLE_PASSWORD
    res = requests.post(
        f"https://roble-api.openlab.uninorte.edu.co/auth/{token_contract}/login",
        json={"email": email, "password": password}
    )
    login_data = res.json()
    access_token = login_data.get("accessToken")
    print("AccessToken recibido:", access_token)  # <-- Aquí imprimes el token en consola
    if not access_token:
        return jsonify({"error": "Credenciales inválidas"}), 401
    return jsonify({"accessToken": access_token})


#ENDPOINTS CRUD MICROSERVICIOS
#POST -> CREAR MICROSERVICIO
@app.route('/microservices', methods=['POST'])
def add_microservice():
    data = request.json
    name = data.get("name")
    endpoint = data.get("endpoint")
    processing_type = data.get("processing_type")
    code = data.get("code")
    user = data.get("user")
    print("Usuario recibido en el backend POST:", user)
    if not name or not endpoint or not processing_type or not code:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    try:
        microservice = create_and_persist_microservice(name, processing_type, endpoint, code, user)
    except Exception as e:
        return jsonify({"error": f"Error al crear el microservicio: {e}"}), 500

    return jsonify(microservice), 201
# GET -> LISTAR MICROSERVICIOS
@app.route('/microservices', methods=['GET'])
def get_microservices():
    if not is_docker_active():
        print("DOCKER NO SIRVE")
        return jsonify({"error": "Docker no está activo. Por favor, inicie el servicio Docker."}), 500
    else:
        print("DOCKER SI SIRVE")
        # Leer usuario del header o usar 'guest' por defecto
        user = request.headers.get('X-User') or 'guest'
        print("Usuario solicitado:", user)
        microservices = load_microservices()
        # Filtrar por usuario
        microservices = [ms for ms in microservices if (ms.get('user') or 'guest') == user]
        for ms in microservices:
            # 1. Verifica si el contenedor existe por ID
            inspect_proc = subprocess.run(
                ["docker", "inspect", ms["id"]],
                capture_output=True, text=True
            )
            if inspect_proc.returncode != 0:
                # Si el ID no existe, intenta buscar por nombre
                ps_name_proc = subprocess.run([
                    "docker", "ps", "-a", "--filter", f"name=^{ms['image_name']}$", "--format", "{{.ID}}"
                ], capture_output=True, text=True)
                found_id = ps_name_proc.stdout.strip()
                if found_id:
                    ms["id"] = found_id[:12]
                    save_microservices(load_microservices())
                else:
                    # El contenedor no existe, intenta reconstruirlo y levantarlo
                    folder_path = os.path.join("historial", ms.get("folder_name", ""))
                    if os.path.exists(folder_path):
                        # Construir la imagen si no existe
                        subprocess.run([
                            "docker", "build", "-t", ms["image_name"], folder_path
                        ], check=True)
                        # Crear el contenedor
                        run_proc = subprocess.run([
                            "docker", "run", "-d", "-P", "--name", ms["image_name"], ms["image_name"]
                        ], capture_output=True, text=True)
                        if run_proc.returncode == 0:
                            new_id = run_proc.stdout.strip()[:12]
                            ms["id"] = new_id
                            # Actualizar el JSON con el nuevo ID
                            save_microservices(load_microservices())
                    else:
                        ms["status"] = "error: carpeta no encontrada"
                        continue

            # Estado
            ps_cmd = [
                "docker", "ps", "--filter", f"id={ms['id']}",
                "--format", "{{.Status}}"
            ]
            status_result = subprocess.run(ps_cmd, capture_output=True, text=True)
            ms["status"] = status_result.stdout.strip() or "stopped"

            # Si está detenido, intenta iniciarlo
            if ms["status"] == "stopped":
                subprocess.run(["docker", "start", ms["id"]], check=False)
                # Vuelve a consultar el estado
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
    if not is_docker_active():
        return jsonify({"error": "Docker no está activo. Por favor, inicie el servicio Docker."}), 500
    else:
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
    port = data.get("port")
    microservice = update_microservice(container_id, name, processing_type, endpoint, code, port)
    if not microservice:
        return jsonify({"error": "Microservicio no encontrado"}), 404
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



# ENDPOINT para obtener el main.py real de un microservicio
@app.route('/microservices/<string:container_id>/mainpy', methods=['GET'])
def get_microservice_mainpy(container_id):
    microservices = load_microservices()
    ms = next((m for m in microservices if m["id"] == container_id), None)
    if not ms:
        return jsonify({"error": "Microservicio no encontrado"}), 404
    folder_name = ms.get("folder_name")
    if not folder_name:
        return jsonify({"error": "No se encontró la carpeta del microservicio"}), 404
    mainpy_path = os.path.join("historial", folder_name, "main.py")
    if not os.path.exists(mainpy_path):
        return jsonify({"error": "No se encontró el archivo main.py"}), 404
    with open(mainpy_path, "r", encoding="utf-8") as f:
        code = f.read()
    return jsonify({"code": code})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)