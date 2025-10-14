
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
app = Flask(__name__)

CORS(app)
def main(data=None):
    """
    Devuelve un saludo simple.
    """
    return {
        "status": "success",
        "message": "Hola mundo desde el microservicio!"
    }


@app.route('/hh', methods=['GET', 'POST'])
def process():
    # Validar token de acceso desde el header Authorization
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"status": "error", "message": "Token de autenticación requerido"}), 401
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return jsonify({"status": "error", "message": "Token vacío"}), 401

    token_contract = request.headers.get('Token-Contract') or request.args.get('token_contract')
    if not token_contract:
        return jsonify({"status": "error", "message": "Token contract no recibido"}), 400

    # Verificar el token con la API de Roble
    res = requests.get(
        f"https://roble-api.openlab.uninorte.edu.co/auth/{token_contract}/verify-token",
        headers={"Authorization": f"Bearer {token}"}
    )
    verificacion = res.json()
    if res.status_code == 401:
        return jsonify({"status": "error", "message": "Token inválido o expirado"}), 401
    elif res.status_code == 403:
        return jsonify({"status": "error", "message": "Acceso denegado"}), 403
    elif res.status_code != 200 or not verificacion.get("valid", True):
        return jsonify({"status": "error", "message": f"Error de autenticación Roble: {res.status_code}"}), res.status_code

    # Construir el diccionario data para pasar a main
    if request.method == 'POST':
        data = request.get_json() or {}
    else:
        data = dict(request.args)
    data['roble_token'] = token
    data['token_contract'] = token_contract

    # Ejecutar la función principal del usuario
    try:
        resultado = main(data)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
