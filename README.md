# 🍁 Oak Services

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Roble](https://img.shields.io/badge/Roble-000000?style=for-the-badge&logoColor=white)
---

## 🪵 Descripción general

**Oak Services** es una plataforma web que permite a los usuarios **crear, editar, eliminar y listar microservicios** de manera segura y aislada, con **autenticación Roble**, gestión de usuarios y **despliegue automático en contenedores Docker**.

Incluye:
- **Frontend en React**
- **Backend en Flask**
- **Orquestación con Docker Compose**

Cada usuario puede administrar **únicamente sus propios microservicios**, los cuales se ejecutan en contenedores Docker independientes y validados automáticamente con Roble.

---

## 👩‍💻 Integrantes / Desarrolladores
 
- Natalia Carpintero
- Isabella Arrieta  
- Paula Núñez  
- Luis Robles  

---

## ⚙️ Instrucciones de uso

### 🧱 Requisitos previos
- Tener **Docker** y **Docker Compose** instalados.  
- Contar con un archivo `.env` válido en la carpeta `Backend` (requerido para el acceso como invitado).  

---

### 🚀 Configuración rápida

```bash
# 1️⃣ Clonar el repositorio
git clone <url-repositorio>
cd MicroserviciosNIPL

# 2️⃣ Crear archivo .env en Backend
nano Backend/.env

# 3️⃣ Construir y ejecutar contenedores
docker compose up --build
```

Accede a:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
---
### 🌐 Uso general de la plataforma

1. Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador.  
2. Inicia sesión con tus credenciales de **Roble** o accede como **Invitado**.  
3. Visualiza la tabla de microservicios con sus campos:

   | Campo | Descripción |
   |--------|-------------|
   | 🧩 Nombre | Identificador del microservicio |
   | ⚙️ Tipo de procesamiento | Hola Mundo/ Suma/ Consulta Roble |
   | 🆔 ID | Identificador único |
   | 🔌 Puerto | Puerto Docker asignado |
   | 📶 Estado | Activo / Inactivo |
   | 🌎 Endpoint | URL local o remota |
   | 🧭 Acciones | Ver, Editar, Eliminar |

4. **Acciones disponibles:**
   - 🔄 **Recargar Tabla**  
   - ➕ **Crear microservicio**  
   - ✏️ **Editar**  
   - 👁️ **Ver código**  
   - ❌ **Eliminar**  
   - 🔗 **Probar endpoint**
   - 🔁 **Renovar Token**
   > **Nota importante:** Para probar un **endpoint**, el **token Roble** debe estar **activo y vigente**.  
   > Si el token ha expirado, utiliza la opción **Renovar Token** para obtener uno nuevo antes de continuar.

6. Comprueba el estado de conexión con Docker desde el **indicador bajo la tabla**.

7. En el menú superior derecho podrás ver:
   - Información del usuario  
   - Project ID activo
   - Botón para renovar token 
   - Opción de cerrar sesión   

8. Accede al **slideboard lateral izquierdo** para más información e instrucciones.

---

### 🧩 Crear o editar un microservicio

1. Asigna un **nombre** al microservicio.  
2. Selecciona el **tipo de procesamiento** (p. ej. *Hola Mundo* *Suma* o *Consulta Roble*).  
3. *(Opcional)* Escoge un **ejemplo de código predefinido**.  
4. Escribe o modifica tu código directamente en el **editor integrado**.  
5. Haz clic en **Crear** para desplegarlo en un contenedor **Docker**.

---

## 🔐 Validación automática con Roble

> **¿Qué es Roble?**  
> **Roble** es una plataforma tecnológica creada por **OPENLAB – Universidad del Norte**, que ofrece autenticación centralizada y gestión de bases de datos para proyectos académicos y de innovación.  
> Utiliza **JWT (JSON Web Tokens)** y un sistema de verificación por tokens seguros para permitir que las aplicaciones validen usuarios sin necesidad de manejar credenciales directamente.

Cada microservicio creado en **Oak Services** se genera con código Flask que incluye esta **validación automática de Roble**, asegurando que solo usuarios autenticados puedan ejecutar sus servicios.

### 🔧 Función generadora en el backend

```python
def generar_codigo_flask(codigo_usuario, endpoint):
    match = re.search(r'def\s+(\w+)\s*\(', codigo_usuario)
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
'''
```
> ✅ *Así, cada microservicio desplegado valida el token Roble antes de ejecutar cualquier operación.*

---

## 🧪 Ejemplos de solicitudes

### 1️⃣ Hola Mundo

**Código:**
```python
def main(data=None):
    """
    Devuelve un saludo simple.
    """
    return {
        "status": "success",
        "message": "Hola mundo desde el microservicio!"
    }
```

**Respuesta:**
GET
http://localhost:32768/hola
```json
{
  "message": "Hola mundo desde el microservicio!",
  "status": "success"
}
```

### 2️⃣ Suma de dos números

**Código:**

```python
# Microservicio Suma
# Los parámetros 'a' y 'b' se pasan en la URL como /?a=5&b=3

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
```

**Respuesta:**
GET
http://localhost:32769/suma?a=5&b=3
```json
{
  "inputs": {
    "a": 5,
    "b": 3
  },
  "status": "success",
  "suma": 8
}
```

### 3️⃣ Consultar tabla en Roble

**Código:**

```python
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
```

**Respuesta:**
GET
http://localhost:32770/roble_table?tableName=eventos_demo
```json
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
    {
      "_id": "YBDBR_kIP9wA",
      "cupos": 50,
      "descripcion": "Presentación de proyectos creados con Roble",
      "encargado": "Facultad de Ingeniería",
      "fecha": "2025-11-02",
      "lugar": "Bloque K",
      "nombre": "Feria de Proyectos Roble",
      "tipo": "Feria"
    },
    {
      "_id": "uxTojX_QQY1E",
      "cupos": 35,
      "descripcion": "Introducción práctica a IA para principiantes.",
      "encargado": "Programa de Ingeniería de Sistemas",
      "fecha": "2025-11-10",
      "lugar": "Bloque K",
      "nombre": "Taller de Inteligencia Artificial",
      "tipo": "Taller"
    },
    {
      "_id": "kOdg331WEzIu",
      "cupos": 60,
      "descripcion": "Conversatorio sobre prácticas sostenibles en el campus.",
      "encargado": "Departamento de Ecología",
      "fecha": "2025-11-18",
      "lugar": "Bloque M",
      "nombre": "Charla sobre Sostenibilidad",
      "tipo": "Charla"
    },
    {
      "_id": "ubDTbg8aHsKJ",
      "cupos": 25,
      "descripcion": "Introducción al diseño de robots educativos.",
      "encargado": "Programa de Electrónica",
      "fecha": "2025-12-03",
      "lugar": "Laboratorio de Electrónica",
      "nombre": "Taller de Robótica Educativa",
      "tipo": "Taller"
    }
  ],
  "status": "success"
}
```

---
  
## 📄 Licencia

Este proyecto está bajo la **licencia MIT**.  
Desarrollado con ♥️ por el equipo de **Oak Services**.



