microservices = []  # Lista en memoria para almacenar los microservicios

def create_microservice(name, endpoint, processing_type):
    """Crea un nuevo microservicio."""
    microservice = {
        "id": len(microservices) + 1,
        "name": name,
        "endpoint": endpoint,
        "processing_type": processing_type,
    }
    microservices.append(microservice)
    return microservice

def list_microservices():
    """Devuelve la lista de microservicios."""
    return microservices

def update_microservice(microservice_id, name, endpoint, processing_type):
    """Actualiza un microservicio existente."""
    for microservice in microservices:
        if microservice["id"] == microservice_id:
            microservice["name"] = name
            microservice["endpoint"] = endpoint
            microservice["processing_type"] = processing_type
            return microservice
    return None

def delete_microservice(microservice_id):
    """Elimina un microservicio por su ID."""
    global microservices
    microservices = [m for m in microservices if m["id"] != microservice_id]
    return True