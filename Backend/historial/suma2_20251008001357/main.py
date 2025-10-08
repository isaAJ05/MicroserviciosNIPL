
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Microservicio Suma

def main(data=None):
    """
    Suma dos números recibidos por parámetro.
    Args:
        data: dict con 'a' y 'b'
    Returns:
        dict con el resultado de la suma
    """
    try:
        a = float(data.get("a", 0))
        b = float(data.get("b", 0))
        resultado = a + b
        return {
            "status": "success",
            "suma": resultado,
            "inputs": {"a": a, "b": b},
             "data": data
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    print(main())

@app.route('/suma2', methods=['GET', 'POST'])
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
