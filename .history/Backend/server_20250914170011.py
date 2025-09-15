import requests

ROBLE_AUTH_URL = "https://roble.openlab.uninorte.edu.co/auth"

def validate_token(token):
    """Valida un token con el sistema Roble."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{ROBLE_AUTH_URL}/validate", headers=headers)
    
    if response.status_code == 200:
        return response.json()  # Token válido, retorna datos del usuario
    elif response.status_code == 401:
        raise ValueError("Token inválido o expirado")
    else:
        raise Exception("Error al validar el token con Roble")