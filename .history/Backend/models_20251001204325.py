microservices = []  # Lista en memoria para almacenar los microservicios
last_id = 0         # Contador global para IDs únicos

def create_microservice(name, endpoint, processing_type, code, port):
    global last_id
    last_id += 1
    microservice = {
        "id": last_id,
        "name": name,
        "endpoint": endpoint,
        "processing_type": processing_type,
        "code": code,
        "status": "created",
        "image_name": name.lower().replace(" ", "_"),
        "port": port  # <-- Guarda el puerto aquí
    }
    microservices.append(microservice)
    return microservice

def list_microservices():
    """Devuelve la lista de microservicios."""
    return microservices

def update_microservice(microservice_id, name, endpoint, processing_type, code):
    """Actualiza un microservicio existente."""
    for microservice in microservices:
        if microservice["id"] == microservice_id:
            microservice["name"] = name
            microservice["endpoint"] = endpoint
            microservice["processing_type"] = processing_type
            microservice["code"] = code
            return microservice
    return None

def delete_microservice(microservice_id):
    """Elimina un microservicio por su ID."""
    global microservices
    microservices = [m for m in microservices if m["id"] != microservice_id]
    return True