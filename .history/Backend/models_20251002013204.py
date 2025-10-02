import subprocess
import json
import os
from datetime import datetime
import shutil
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
    # ...guardar main.py y Dockerfile en ms_dir...

    # 2. Construye la imagen Docker
    build_cmd = ["docker", "build", "-t", image_name, ms_dir]
    subprocess.run(build_cmd, check=True)

    # 3. Lanza el contenedor y obtiene el Container ID
    run_cmd = ["docker", "run", "-d", "-P", "--name", image_name, image_name]
    result = subprocess.run(run_cmd, capture_output=True, text=True, check=True)
    container_id = result.stdout.strip()[:12]

    # 4. Consulta Docker para obtener el puerto y estado
    inspect_cmd = [
        "docker", "inspect",
        "--format", "{{(index (index .NetworkSettings.Ports \"8000/tcp\") 0).HostPort}}",
        container_id
    ]
    port_result = subprocess.run(inspect_cmd, capture_output=True, text=True)
    port = port_result.stdout.strip()

    ps_cmd = [
        "docker", "ps", "--filter", f"id={container_id}",
        "--format", "{{.Status}}"
    ]
    status_result = subprocess.run(ps_cmd, capture_output=True, text=True)
    status = status_result.stdout.strip()

    # 5. Guarda en JSON
    microservices = load_microservices()
    microservice = {
        "id": container_id,
        "name": name,
        "processing_type": processing_type,
        "image_name": image_name,
        "folder_name": folder_name,  # <--- Guarda el nombre de la carpeta
        "port": port,
        "status": status,
        "endpoint": endpoint,
        "code": code,  
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    microservices.append(microservice)
    save_microservices(microservices)
    return microservice