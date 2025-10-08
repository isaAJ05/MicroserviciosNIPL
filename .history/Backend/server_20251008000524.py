from flask import Flask, request, jsonify
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
ROBLE_PROJECT_TOKEN = os.getenv("token_contract_xyz")
ROBLE_EMAIL = os.getenv("email")
ROBLE_PASSWORD = os.getenv("password")

app = Flask(__name__)
CORS(app)

#ENDPOINTS ROBLE
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    token_contract = data.get('token_contract')
    res = requests.post(
        f"https://roble-api.openlab.uninorte.edu.co/auth/{token_contract}/login",
        json={"email": email, "password": password}
    )
    login_data = res.json()
    access_token = login_data.get("accessToken")
    if not access_token:
        return jsonify({"error": "Credenciales inválidas"}), 401
    return jsonify({"accessToken": access_token})

@app.route('/get-roble-token', methods=['GET'])
def get_roble_token():
    try:
        login_res = requests.post(
            f"https://roble-api.openlab.uninorte.edu.co/auth/{ROBLE_PROJECT_TOKEN}/login",
            json={
                "email": ROBLE_EMAIL,
                "password": ROBLE_PASSWORD
            }
        )
        login_data = login_res.json()
        access_token = login_data.get("accessToken")
        if not access_token:
            return jsonify({"error": "No se pudo obtener accessToken", "login_response": login_data}), 401
        return jsonify({"accessToken": access_token}), 200
    except Exception as e:
        return jsonify({"error": f"Error en login Roble: {str(e)}"}), 500
#LOGIN USUARIO - Devuelve token JWT
# READ TABLA ROBLE
@app.route('/roble-read', methods=['GET'])
def roble_read():
    table_name = request.args.get("tableName", "inventario")  # por defecto "inventario"

    # 1. Primero, haz login para obtener el access token
    try:
        login_res = requests.post(
            f"https://roble-api.openlab.uninorte.edu.co/auth/{ROBLE_PROJECT_TOKEN}/login",
            json={
                "email": ROBLE_EMAIL,
                "password": ROBLE_PASSWORD
            }
        )
        login_data = login_res.json()
        access_token = login_data.get("accessToken")
        if not access_token:
            return jsonify({"error": "No se pudo obtener accessToken", "login_response": login_data}), 401
    except Exception as e:
        return jsonify({"error": f"Error en login Roble: {str(e)}"}), 500

    # 2. Luego, consulta la tabla usando ese access token
    try:
        res = requests.get(
            f"https://roble-api.openlab.uninorte.edu.co/database/{ROBLE_PROJECT_TOKEN}/read",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"tableName": table_name}
        )
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#ENDPOINTS CRUD MICROSERVICIOS
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
        # Crear y persistir el microservicio (esto debe generar el Dockerfile y guardar archivos)
        microservice = create_and_persist_microservice(name, processing_type, endpoint, code)
        folder_path = microservice.get("folder_path")
        image_name = microservice.get("image_name")

        # Construir la imagen Docker
        build_proc = subprocess.run(
            ["docker", "build", "-t", image_name, folder_path],
            capture_output=True, text=True
        )
       
        # Crear y levantar el contenedor
        run_proc = subprocess.run(
            ["docker", "run", "-d", "-P", "--name", image_name, image_name],
            capture_output=True, text=True
        )

        # Guardar el ID del contenedor
        container_id = run_proc.stdout.strip()[:12]
        microservice["id"] = container_id

        # (Opcional) Actualiza el registro del microservicio con el nuevo ID
        save_microservices([microservice])

    except Exception as e:
        return jsonify({"error": f"Error al crear el microservicio: {e}"}), 500

    return jsonify(microservice), 201
# GET -> LISTAR MICROSERVICIOS
@app.route('/microservices', methods=['GET'])
def get_microservices():
    microservices = load_microservices()
    for ms in microservices:
        # 1. Verifica si el contenedor existe en Docker
        inspect_proc = subprocess.run(
            ["docker", "inspect", ms["id"]],
            capture_output=True, text=True
        )
        if inspect_proc.returncode != 0:
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
                    save_microservices(microservices)
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