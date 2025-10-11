import subprocess
import json
import os
from datetime import datetime
import shutil
from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
import os
import subprocess
from datetime import datetime
import re
import subprocess
import uuid
import tempfile
from flask_cors import CORS
DATA_FILE = "microservices.json"

def load_microservices():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_microservices(microservices):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(microservices, f, ensure_ascii=False, indent=2)
def delete_microservice_by_id(container_id):
    microservices = load_microservices()
    ms = next((m for m in microservices if m["id"] == container_id), None)
    # Elimina del JSON
    microservices = [m for m in microservices if m["id"] != container_id]
    save_microservices(microservices)
    # Elimina la carpeta física si existe
    base_dir = "historial"
    if ms and "folder_name" in ms:
        folder_path = os.path.join(base_dir, ms["folder_name"])
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path, ignore_errors=True)
def create_and_persist_microservice(name, processing_type, endpoint, code):
    image_name = name.lower().replace(" ", "_")
    base_dir = "historial"
    os.makedirs(base_dir, exist_ok=True)
    folder_name = f"{image_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    ms_dir = os.path.join(base_dir, folder_name)
    os.makedirs(ms_dir, exist_ok=True)

    # 1. Generar main.py con Flask y el código del usuario
    main_code = generar_codigo_flask(code, endpoint)
    with open(os.path.join(ms_dir, "main.py"), "w", encoding="utf-8") as f:
        f.write(main_code)

    # 2. Generar Dockerfile
    dockerfile_content = f"""
FROM python:3.10-slim
WORKDIR /app
COPY main.py /app/main.py
RUN pip install flask requests flask-cors
EXPOSE 8000
CMD ["python", "main.py"]
"""
    with open(os.path.join(ms_dir, "Dockerfile"), "w", encoding="utf-8") as f:
        f.write(dockerfile_content)

    # 3. Construir la imagen Docker
    build_cmd = ["docker", "build", "-t", image_name, ms_dir]
    result = subprocess.run(build_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(result.stderr)

    # 4. Lanzar el contenedor y obtener el Container ID
    run_cmd = ["docker", "run", "-d", "-P", "--name", image_name, image_name]
    result = subprocess.run(run_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(result.stderr)
    container_id = result.stdout.strip()[:12]

    # 5. Consultar Docker para obtener el puerto
    inspect_cmd = [
        "docker", "inspect",
        "--format", "{{(index (index .NetworkSettings.Ports \"8000/tcp\") 0).HostPort}}",
        container_id
    ]
    port_result = subprocess.run(inspect_cmd, capture_output=True, text=True)
    port = port_result.stdout.strip()

    # 6. Guardar el microservicio en tu archivo JSON (implementa save_microservices)
    microservice = {
        "id": container_id,
        "name": name,
        "processing_type": processing_type,
        "endpoint": endpoint,
        "image_name": image_name,
        "folder_name": folder_name,
        "port": port,
        "status": "created",
        "code": code  # <--- Así se guarda el código original
    }
    # Aquí deberías cargar los microservicios existentes, agregar el nuevo y guardar
    microservices = load_microservices()
    microservices.append(microservice)
    save_microservices(microservices)

    return microservice
def generar_codigo_flask(codigo_usuario, endpoint):
    # Indentar el código del usuario para que quede dentro del endpoint
    def indent_code(code, spaces=4):
        indent = ' ' * spaces
        return '\n'.join(indent + line if line.strip() else '' for line in code.splitlines())

    codigo_usuario_indentado = indent_code(codigo_usuario)
    return f'''
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/{endpoint}', methods=['GET', 'POST'])
def process():
{codigo_usuario_indentado}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
'''

def update_microservice(container_id, name, processing_type, endpoint, code, port=None):
    microservices = load_microservices()
    ms = next((m for m in microservices if m["id"] == container_id), None)
    if not ms:
        return None

    ms["name"] = name
    ms["processing_type"] = processing_type
    ms["endpoint"] = endpoint
    ms["code"] = code

    base_dir = "historial"
    if "folder_name" in ms:
        ms_dir = os.path.join(base_dir, ms["folder_name"])
        main_code = generar_codigo_flask(code, endpoint)
        with open(os.path.join(ms_dir, "main.py"), "w", encoding="utf-8") as f:
            f.write(main_code)

        image_name = ms["image_name"]
        build_cmd = ["docker", "build", "-t", image_name, ms_dir]
        subprocess.run(build_cmd, check=True)

        subprocess.run(["docker", "rm", "-f", container_id], check=True)
        # Si se especifica un puerto, mapea el puerto
        if port:
            run_cmd = ["docker", "run", "-d", "-p", f"{port}:8000", "--name", image_name, image_name]
        else:
            run_cmd = ["docker", "run", "-d", "-P", "--name", image_name, image_name]
        result = subprocess.run(run_cmd, capture_output=True, text=True)
        ms["id"] = result.stdout.strip()[:12]

        # Actualiza el puerto
        if port:
            ms["port"] = str(port)
        else:
            inspect_cmd = [
                "docker", "inspect",
                "--format", "{{(index (index .NetworkSettings.Ports \"8000/tcp\") 0).HostPort}}",
                ms["id"]
            ]
            port_result = subprocess.run(inspect_cmd, capture_output=True, text=True)
            ms["port"] = port_result.stdout.strip()

    save_microservices(microservices)
    return ms