
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
app = Flask(__name__)

CORS(app)
# Microservicio Consulta Tabla Roble
# El nombre de la tabla se pasa en la URL (?tableName=mi_tabla)
# Puedes agregar más parámetros de filtro si lo desea (?columna=valor)
# El token de acceso y el token_contract se envían por header.

def main(data=None):
    """
    Consulta una tabla en Roble usando el token recibido por header y el token_contract recibido por header o parámetro.
    """
    import requests
    from flask import request

    # Obtener el token de acceso desde el header Authorization
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return {"status": "error", "message": "Token de autenticación requerido"}
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return {"status": "error", "message": "Token vacío"}

    # Obtener el token_contract desde el header o parámetro
    token_contract = request.headers.get('Token-Contract') or request.args.get('token_contract') or (data or {}).get("token_contract")
    if not token_contract:
        return {"status": "error", "message": "Token contract no recibido"}

    # El nombre de la tabla viene en los parámetros (?tableName=...)
    table_name = request.args.get("tableName") or (data or {}).get("tableName", "inventario")

    # Para agregar parámetros de filtro (?columna=valor)
    params = {"tableName": table_name}
    for k, v in (data or {}).items():
        if k not in ["token_contract", "tableName", "roble_token"]:  
            params[k] = v
    for k, v in request.args.items():
        if k not in ["token_contract", "tableName", "roble_token"]:  
            params[k] = v

    # Consulta la tabla en Roble
    res = requests.get(
        f"https://roble-api.openlab.uninorte.edu.co/database/{token_contract}/read",
        headers={"Authorization": f"Bearer {token}"},
        params=params
    )
    if res.status_code == 200:
        return {"status": "success", "roble_data": res.json()}
    elif res.status_code == 401:
        return {"status": "error", "message": "Token inválido o expirado", "code": 401}
    elif res.status_code == 403:
        return {"status": "error", "message": "Acceso denegado", "code": 403}
    else:
        return {"status": "error", "message": f"Roble error: {res.status_code}", "details": res.text}


@app.route('/consulta_roble', methods=['GET', 'POST'])
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
