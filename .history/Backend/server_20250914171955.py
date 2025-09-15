from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

ROBLE_AUTH_URL = "https://roble-api.openlab.uninorte.edu.co/auth/token_contract_xyz"

def login_user(email, password):
    """Realiza el login del usuario y obtiene el accessToken y refreshToken."""
    response = requests.post(f"{ROBLE_AUTH_URL}/login", json={
        "email": email,
        "password": password
    })
    print(response.status_code, response.text)  # Agrega este print para depuración
    if response.status_code == 200:
        return response.json()  # Retorna los tokens
    elif response.status_code == 401:
        raise ValueError("Credenciales inválidas")
    else:
        raise Exception("Error al autenticar con Roble")

def validate_token(token):
    """Valida un token con el sistema Roble."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{ROBLE_AUTH_URL}/verify-token", headers=headers)
    if response.status_code == 200:
        return response.json()  # Token válido, retorna datos del usuario
    elif response.status_code == 401:
        raise ValueError("Token inválido o expirado")
    else:
        raise Exception("Error al validar el token con Roble")

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)