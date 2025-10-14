import subprocess
import json
import os
from datetime import datetime
import shutil
import re
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
DATA_FILE = "microservices.json"

# Funciones para manejar el archivo JSON
def load_microservices():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

# Guarda la lista completa de microservicios
def save_microservices(microservices):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(microservices, f, ensure_ascii=False, indent=2)

# Elimina un microservicio por su ID
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

# Función para crear y persistir un microservicio
def create_and_persist_microservice(name, processing_type, endpoint, code, user):
    image_name = name.lower().replace(" ", "_")
    base_dir = "historial"
    os.makedirs(base_dir, exist_ok=True)
    folder_name = f"{image_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    ms_dir = os.path.join(base_dir, folder_name)
    os.makedirs(ms_dir, exist_ok=True)
    print("Mi usuario es: ", user)
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
        "code": code,  # <--- Así se guarda el código original
        "user": user
    }

    # Aquí deberías cargar los microservicios existentes, agregar el nuevo y guardar
    microservices = load_microservices()
    microservices.append(microservice)
    save_microservices(microservices)

    return microservice

# Función para generar el código Flask completo
def generar_codigo_flask(codigo_usuario, endpoint):
    match = re.search(r'def\s+(\w+)\s*\(', codigo_usuario)
    nombre_funcion = match.group(1) if match else "main"

    return f'''
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
app = Flask(__name__)

CORS(app)
{codigo_usuario}

@app.route('/{endpoint}', methods=['GET', 'POST'])
def process():
    # Validar token de acceso desde el header Authorization
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({{"status": "error", "message": "Token de autenticación requerido"}}), 401
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return jsonify({{"status": "error", "message": "Token vacío"}}), 401

    token_contract = request.headers.get('Token-Contract') or request.args.get('token_contract')
    if not token_contract:
        return jsonify({{"status": "error", "message": "Token contract no recibido"}}), 400

    # Verificar el token con la API de Roble
    res = requests.get(
    f"https://roble-api.openlab.uninorte.edu.co/auth/{{token_contract}}/verify-token",
    headers={{"Authorization": f"Bearer {{token}}"}}
    )
    verificacion = res.json()
    if res.status_code == 401:
        return jsonify({{"status": "error", "message": "Token inválido o expirado"}}), 401
    elif res.status_code == 403:
        return jsonify({{"status": "error", "message": "Acceso denegado"}}), 403
    elif res.status_code != 200 or not verificacion.get("valid", True):
        return jsonify({{"status": "error", "message": f"Error de autenticación Roble: {{res.status_code}}"}}), res.status_code

    # Construir el diccionario data para pasar a main
    if request.method == 'POST':
        data = request.get_json() or {{}}
    else:
        data = dict(request.args)
    data['roble_token'] = token
    data['token_contract'] = token_contract

    # Ejecutar la función principal del usuario
    try:
        resultado = {nombre_funcion}(data)
            return jsonify(resultado)
        except Exception as e:
            return jsonify({{"status": "error", "message": str(e)}}), 500

    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=8000)
    '''
# Función para actualizar un microservicio existente
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