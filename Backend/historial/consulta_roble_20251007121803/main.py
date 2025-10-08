
from flask import Flask, request, jsonify

app = Flask(__name__)

# Microservicio Consulta Tabla Roble (usa credenciales del backend)
import os
import sys
import requests
from dotenv import load_dotenv
def main(data=None):
    """
    Consulta una tabla en Roble usando las credenciales del backend.
    Args:
        data: dict con 'tableName' y filtros opcionales
    Returns:
        dict con la respuesta de Roble
    """
    try:
        # Cargar credenciales del entorno
        load_dotenv()
        token = os.getenv("token_contract_xyz")
        email = os.getenv("email")
        password = os.getenv("password")
        table_name = data.get("tableName", "inventario")

        # 1. Login para obtener access token
        login_res = requests.post(
            f"https://roble-api.openlab.uninorte.edu.co/auth/{token}/login",
            json={"email": email, "password": password}
        )
        login_data = login_res.json()
        access_token = login_data.get("accessToken")
        if not access_token:
            return {"status": "error", "message": "No se pudo obtener accessToken", "login_response": login_data}

        # 2. Consulta la tabla
        params = {"tableName": table_name}
        # Agrega filtros si existen
        for k, v in (data or {}).items():
            if k not in ["tableName"]:
                params[k] = v

        res = requests.get(
            f"https://roble-api.openlab.uninorte.edu.co/database/{token}/read",
            headers={"Authorization": f"Bearer {access_token}"},
            params=params
        )
        if res.status_code == 200:
            return {"status": "success", "roble_data": res.json()}
        else:
            return {"status": "error", "message": f"Roble error: {res.status_code}", "details": res.text}
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    # Solo necesitas el nombre de la tabla y filtros opcionales
    test_data = {"tableName": "inventario"}
    print(str(main(test_data)).encode('utf-8', errors='replace').decode('cp1252', errors='replace'))

@app.route('/consulta_roble', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        data = request.get_json()
    else:
        data = request.args
    resultado = main(data)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
