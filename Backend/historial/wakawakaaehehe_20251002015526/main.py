
from flask import Flask, request, jsonify

app = Flask(__name__)

# Microservicio Hola Mundo

def main(data=None):
    """
    Devuelve un saludo simple.
    """
    return {
        "status": "success",
        "message": "Hola mundo desde el microservicio!",
        "data": data
    }

if __name__ == "__main__":
    print(main())

@app.route('/wakawakaaehehe', methods=['GET', 'POST'])
def process():
    if request.method == 'POST':
        data = request.get_json()
    else:
        data = request.args
    resultado = main(data)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
