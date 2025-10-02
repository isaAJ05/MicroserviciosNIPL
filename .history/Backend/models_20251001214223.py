import json
import os

DATA_FILE = "microservices.json"

def load_microservices():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_microservices(microservices):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(microservices, f, ensure_ascii=False, indent=2)

microservices = load_microservices()
last_id = max([m["id"] for m in microservices], default=0)

def create_microservice(name, endpoint, processing_type, code, port):
    global last_id, microservices
    last_id += 1
    microservice = {
        "id": last_id,
        "name": name,
        "endpoint": endpoint,
        "processing_type": processing_type,
        "code": code,
        "status": "created",
        "image_name": name.lower().replace(" ", "_"),
        "port": port
    }
    microservices.append(microservice)
    save_microservices(microservices)
    return microservice

def list_microservices():
    return microservices

def update_microservice(microservice_id, name, endpoint, processing_type, code):
    for microservice in microservices:
        if microservice["id"] == microservice_id:
            microservice["name"] = name
            microservice["endpoint"] = endpoint
            microservice["processing_type"] = processing_type
            microservice["code"] = code
            save_microservices(microservices)
            return microservice
    return None

def delete_microservice_by_id(microservice_id):
    global microservices
    microservices = [m for m in microservices if m["id"] != microservice_id]
    save_microservices(microservices)
    return True