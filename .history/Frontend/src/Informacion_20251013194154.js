import React from 'react';
import './App.css';

function Informacion() {
    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1c1c1c' }}>
            {/* NAVBAR */}
            <nav className="navbar">
        <button
          className="toggle-history-btn"
          onClick={onBack}
          title="Volver al panel principal"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <img
            src="/red_logo_OSWIDTH.png"
            alt="Logo MicroServicios"
            style={{ height: 44, marginLeft: 12, borderRadius: 12 }}
          />
        </button>
        <h1>I</h1>
      </nav>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div className="info-page" style={{ padding: 32, maxWidth: 1200, margin: '0 auto', fontSize: 17, background: '#1c1c1c' }}>
                    <h1 style={{ marginBottom: 10 }}>🍁 Oak Services</h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                        <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
                        <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
                        <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
                        <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
                        <img src="https://img.shields.io/badge/Roble-000000?style=for-the-badge&logoColor=white" alt="Roble" />
                    </div>
                    <hr />
                    <h2>🪵 Descripción general</h2>
                    <p><b>Oak Services</b> es una plataforma web que permite a los usuarios <b>crear, editar, eliminar y listar microservicios</b> de manera segura y aislada, con <b>autenticación Roble</b>, gestión de usuarios y <b>despliegue automático en contenedores Docker</b>.</p>
                    <ul>
                        <li><b>Frontend en React</b></li>
                        <li><b>Backend en Flask</b></li>
                        <li><b>Orquestación con Docker Compose</b></li>
                    </ul>
                    <p>
                        Cada usuario puede administrar <b>únicamente sus propios microservicios</b>, los cuales se ejecutan en contenedores Docker independientes y validados automáticamente con Roble.
                    </p>
                    <hr />
                    <h2>👩‍💻 Integrantes</h2>
                    <ul>
                        <li>Natalia Carpintero</li>
                        <li>Isabella Arrieta</li>
                        <li>Paula Núñez</li>
                        <li>Luis Robles</li>
                    </ul>
                    <hr />
                    <h2>⚙️ Instrucciones de uso</h2>
                    <h3>🧱 Requisitos previos</h3>
                    <ul>
                        <li>Tener <b>Docker</b> y <b>Docker Compose</b> instalados.</li>
                        <li>Contar con un archivo <code>.env</code> válido en la carpeta <code>Backend</code> (requerido para el acceso como invitado).</li>
                    </ul>
                    <h3>🚀 Configuración rápida</h3>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 15, overflowX: 'auto' }}>
{`# 1️⃣ Clonar el repositorio
git clone <url-repositorio>
cd MicroserviciosNIPL

# 2️⃣ Construir y ejecutar contenedores
docker compose up --build`}
                    </pre>
                    <p>Accede a:</p>
                    <ul>
                        <li>Frontend: <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">http://localhost:3000</a></li>
                        <li>Backend: <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer">http://localhost:5000</a></li>
                    </ul>
                    <hr />
                    <h3>🌐 Uso general de la plataforma</h3>
                    <ol>
                        <li>Abre <b>http://localhost:3000</b> en tu navegador.</li>
                        <li>Inicia sesión con tus credenciales de <b>Roble</b> o accede como <b>Invitado</b>.</li>
                        <li>Visualiza la tabla de microservicios con sus campos:</li>
                    </ol>
                    <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 18 }}>
                        <thead>
                            <tr style={{ background: '#1c1c1c' }}>
                                <th style={{ border: '1px solid #ccc', padding: 6 }}>Campo</th>
                                <th style={{ border: '1px solid #ccc', padding: 6 }}>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>🧩 Nombre</td><td>Identificador del microservicio</td></tr>
                            <tr><td>⚙️ Tipo de procesamiento</td><td>Hola Mundo/ Suma/ Consulta Roble</td></tr>
                            <tr><td>🆔 ID</td><td>Identificador único</td></tr>
                            <tr><td>🔌 Puerto</td><td>Puerto Docker asignado</td></tr>
                            <tr><td>📶 Estado</td><td>Activo / Inactivo</td></tr>
                            <tr><td>🌎 Endpoint</td><td>URL local o remota</td></tr>
                            <tr><td>🧭 Acciones</td><td>Ver, Editar, Eliminar</td></tr>
                        </tbody>
                    </table>
                    <ol start={4}>
                        <li><b>Acciones disponibles:</b>
                            <ul>
                                <li>🔄 Recargar Tabla</li>
                                <li>➕ Crear microservicio</li>
                                <li>✏️ Editar</li>
                                <li>👁️ Ver código</li>
                                <li>❌ Eliminar</li>
                                <li>🔗 Probar endpoint</li>
                                <li>🔁 Renovar Token</li>
                            </ul>
                            <div style={{ fontSize: 15, color: '#b91c1c', marginTop: 6 }}>
                                <b>Nota importante:</b> Para probar un <b>endpoint</b>, el <b>token Roble</b> debe estar <b>activo y vigente</b>.<br />
                                Si el token ha expirado, utiliza la opción <b>Renovar Token</b> para obtener uno nuevo antes de continuar.
                            </div>
                        </li>
                        <li>Comprueba el estado de conexión con Docker desde el <b>indicador bajo la tabla</b>.</li>
                        <li>En el menú superior derecho podrás ver:
                            <ul>
                                <li>Información del usuario</li>
                                <li>Project ID activo</li>
                                <li>Botón para renovar token</li>
                                <li>Opción de cerrar sesión</li>
                            </ul>
                        </li>
                        <li>Accede al <b>slideboard lateral izquierdo</b> para más información e instrucciones.</li>
                    </ol>
                    <hr />
                    <h3>🧩 Crear o editar un microservicio</h3>
                    <ol>
                        <li>Asigna un <b>nombre</b> al microservicio.</li>
                        <li>Selecciona el <b>tipo de procesamiento</b> (p. ej. Hola Mundo, Suma o Consulta Roble).</li>
                        <li>(Opcional) Escoge un <b>ejemplo de código predefinido</b>.</li>
                        <li>Escribe o modifica tu código directamente en el <b>editor integrado</b>.</li>
                        <li>Haz clic en <b>Crear</b> para desplegarlo en un contenedor <b>Docker</b>.</li>
                    </ol>
                    <hr />
                    <h2>🔐 Validación automática con Roble</h2>
                    <p><b>¿Qué es Roble?</b><br />
                        Roble es una plataforma tecnológica creada por <b>OPENLAB – Universidad del Norte</b>, que ofrece autenticación centralizada y gestión de bases de datos para proyectos académicos y de innovación.<br />
                        Utiliza <b>JWT (JSON Web Tokens)</b> y un sistema de verificación por tokens seguros para permitir que las aplicaciones validen usuarios sin necesidad de manejar credenciales directamente.
                    </p>
                    <p>
                        Cada microservicio creado en <b>Oak Services</b> se genera con código Flask que incluye esta <b>validación automática de Roble</b>, asegurando que solo usuarios autenticados puedan ejecutar sus servicios.
                    </p>
                    <h4>Función generadora en el backend</h4>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`def generar_codigo_flask(codigo_usuario, endpoint):
    match = re.search(r'def\\s+(\\w+)\\s*\\(', codigo_usuario)
    nombre_funcion = match.group(1) if match else "main"

    return f'''
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
app = Flask(__name__)
CORS(app)

{codigo_usuario}

@app.route('/{endpoint}', methods=['GET', 'POST'])
def process():
    # Validar token Roble
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({{"status": "error", "message": "Token de autenticación requerido"}}), 401
    token = auth_header.replace('Bearer ', '').strip()

    token_contract = request.headers.get('Token-Contract') or request.args.get('token_contract')
    if not token_contract:
        return jsonify({{"status": "error", "message": "Token contract no recibido"}}), 400

    # Verificar el token con la API de Roble
    res = requests.get(
        f"https://roble-api.openlab.uninorte.edu.co/auth/{{token_contract}}/verify-token",
        headers={{"Authorization": f"Bearer {{token}}"}}
    )

    if res.status_code != 200:
        return jsonify({{"status": "error", "message": "Token inválido o expirado"}}), res.status_code

    # Ejecutar la función principal del usuario
    data = request.get_json() if request.method == 'POST' else dict(request.args)
    data['roble_token'] = token
    data['token_contract'] = token_contract

    try:
        resultado = {nombre_funcion}(data)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({{"status": "error", "message": str(e)}}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
'''`}
                    </pre>
                    <div style={{ fontSize: 15, color: '#1aaf5d', marginTop: 6 }}>
                        ✅ Así, cada microservicio desplegado valida el token Roble antes de ejecutar cualquier operación.
                    </div>
                    <hr />
                    <h2>🧪 Ejemplos de solicitudes</h2>
                    <h4>1️⃣ Hola Mundo</h4>
                    <b>Código:</b>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`def main(data=None):
    \"\"\"
    Devuelve un saludo simple.
    \"\"\"
    return {
        \"status\": \"success\",
        \"message\": \"Hola mundo desde el microservicio!\"
    }`}
                    </pre>
                    <b>Respuesta:</b>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`GET
http://localhost:32768/hola
{
  "message": "Hola mundo desde el microservicio!",
  "status": "success"
}`}
                    </pre>
                    <h4>2️⃣ Suma de dos números</h4>
                    <b>Código:</b>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`# Microservicio Suma
# Los parámetros 'a' y 'b' se pasan en la URL como /?a=5&b=3

def main(data=None):
  \"\"\"
  Suma dos números recibidos por parámetro.
  Args:
    data: dict con 'a' y 'b'
  Returns:
    dict con el resultado de la suma
  \"\"\"
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
    }`}
                    </pre>
                    <b>Respuesta:</b>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`GET
http://localhost:32769/suma?a=5&b=3
{
  "inputs": {
    "a": 5,
    "b": 3
  },
  "status": "success",
  "suma": 8
}`}
                    </pre>
                    <h4>3️⃣ Consultar tabla en Roble</h4>
                    <b>Código:</b>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`# Microservicio Consulta Tabla Roble
# El nombre de la tabla se pasa en la URL (?tableName=mi_tabla)
# Puedes agregar más parámetros de filtro si lo desea (?columna=valor)
# El token de acceso y el token_contract se envían por header.

def main(data=None):
    \"\"\"
    Consulta una tabla en Roble usando el token recibido por header y el token_contract recibido por header o parámetro.
    \"\"\"
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
`}
                    </pre>
                    <b>Respuesta:</b>
                    <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, overflowX: 'auto' }}>
{`GET
http://localhost:32770/roble_table?tableName=eventos_demo
{
  "roble_data": [
    {
      "_id": "baD5ow7kmsJn",
      "cupos": 200,
      "descripcion": "Charla de bienvenida para nuevos estudiantes.",
      "encargado": "Bienestar Universitario",
      "fecha": "2025-10-25",
      "lugar": "Auditorio Principal",
      "nombre": "Bienvenida a Nuevos Estudiantes",
      "tipo": "Charla"
    },
    ...
  ],
  "status": "success"
}`}
                    </pre>
                    <hr />
                    <h2>📄 Licencia</h2>
                    <p>Este proyecto está bajo la <b>licencia MIT</b>.<br />Desarrollado con ♥️ por el equipo de <b>Oak Services</b>.</p>
                </div> 
            </div>
            {/* FOOTER */}
            <footer className="footer">
                <div>
                    Oak Services &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
                </div>
                <div>
                    <span>Contacto: oakservicesglobal@gmail.com</span>
                </div>
            </footer>
        </div>
    );
}

export default Informacion;