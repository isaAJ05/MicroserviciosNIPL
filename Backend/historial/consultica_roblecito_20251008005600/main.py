
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Microservicio Consulta Tabla Roble (usa token recibido por header y token_contract por parámetro)
def main(data=None):
    """
    Consulta una tabla en Roble usando el token recibido por header y el token_contract recibido por parámetro.
    """
    import requests
    try:
        # El token de Roble viene en data['roble_token']
        token = data.get("roble_token")
        if not token:
            return {"status": "error", "message": "Token de autenticación no recibido"}

        # El token_contract viene en los parámetros
        token_contract = data.get("token_contract")
        if not token_contract:
            return {"status": "error", "message": "Token contract no recibido"}

        table_name = data.get("tableName", "inventario")

        # Puedes agregar más parámetros de filtro si lo deseas
        params = {"tableName": table_name}
        for k, v in (data or {}).items():
            if k not in ["roble_token", "token_contract", "tableName"]:
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
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}


@app.route('/consultica_roblecito', methods=['GET', 'POST'])
def process():
    # Leer token del header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Token de autenticación requerido"}), 401
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return jsonify({"error": "Token vacío"}), 401

    # Leer parámetros
    if request.method == 'POST':
        data = request.get_json() or {}
    else:
        data = dict(request.args)
    data['roble_token'] = token

    try:
        resultado = main(data)
        return jsonify(resultado)
    except PermissionError:
        return jsonify({"error": "Acceso denegado"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
