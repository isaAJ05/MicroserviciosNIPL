
from flask import Flask, request, jsonify

app = Flask(__name__)

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
            "inputs": {"a": a, "b": b}
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    test_data = {"a": 10, "b": 7}
    print(main(test_data))

@app.route('/sumita', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        data = request.get_json()
    else:
        data = request.args
    resultado = main(data)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
