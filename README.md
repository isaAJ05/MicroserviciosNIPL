# DESCRIPCIÓN DEL PROYECTO

Plataforma web que permite a sus usuarios crear, editar, eliminar y listar microservicios con autenticación Roble, gestión de usuarios y despliegue automático de microservicios en contenedores Docker. Incluye frontend en React y backend en Flask, ambos orquestados con Docker Compose. Cada usuario de esta plataforma solo ve y gestiona sus propios microservicios, los cuales se ejecutan en contenedores Docker aislados. 

## Integrantes/Desarrolladores

- Isabella Arrieta
- Natalia Carpintero
- Paula Núñez
- Luis Robles

# INSTRUCCIONES DE USO

## Requisitos

- Docker y Docker Compose instalados en tu máquina.
- Descarga previa de archivo .env en caso de desear ingresar como invitado.

## Configuración rápida

1. Clona este repositorio y ubícate en la carpeta raíz (`MicroserviciosNIPL`).
2. Crea un archivo en `Backend/.env` para entrar como invitado.
3. Ejecuta en terminal:
   ```sh
   docker compose up --build
   ```
4. El backend estará disponible en el puerto http://localhost:5000 y el frontend en http://localhost:3000

## Uso general de la plataforma

1. Abre http://localhost:3000 en tu navegador de preferencia.
2. Inicia sesión con tus credenciales de Roble o entra como Invitado.
3. Visualiza la tabla de microservicios con sus campos: Nombre, tipo de procesamiento, ID, puerto, estado, endpoint y acciones varias.
4. Accede a opciones como ver endpoint, crear [ + ], editar [ lapiz ], ver código [ ojo ] y eliminar [ x ] microservicios Python desde los botones que ofrece el dashboard.
5. Verifica la conexión de Docker desde el campo debajo de la tabla.
6. Desde el botón superior derecho de la página principal podrá ver información del usuario y el project ID en uso junto con la opción de cerrar sesión y de renovar token en caso de expirado.
7. Obtén información adicional con respecto al proyecto e instrucciones desde el slideboard a la izquierda.

### Agregar/Editar microservicio
1. Ingrese el nombre que desee colocar a su microservicio.
2. Seleccione el tipo de procesamiento desde la barra desplegable.
3. De manera opcional, escoja un ejemplo de código predeterminado.
4. Ingrese o edite su código desde el campo a la derecha.
5. Confirme su solicitud.

### Ver endpoint
---

# EJEMPLOS DE SOLICITUDES

## Print 'Hola mundo'

### Solicitud:

```
GET http://localhost:<puerto_microservicio>/hola_mundo
Headers: Authorization: Bearer <accessToken>, Token-Contract: <token_contract>
```

### Respuesta:

```json
{
  "status": "success",
  "message": "Hola mundo desde el microservicio!"
}
```

## Suma de dos números

### Solicitud:

```
GET http://localhost:<puerto_microservicio>/suma?a=5&b=3
Headers: Authorization: Bearer <accessToken>, Token-Contract: <token_contract>
```

### Respuesta:

```json
{
  "status": "success",
  "suma": 8,
  "inputs": { "a": 5, "b": 3 }
}
```

## Consultar tabla en Roble

### Solicitud:

```
GET http://localhost:<puerto_microservicio>/consulta_roble?tableName=inventario
Headers: Authorization: Bearer <accessToken>, Token-Contract: <token_contract>
```

### Respuesta:

```json
{
  "status": "success",
  "roble_data": {...}
}
```

---

# NOTAS IMPORTANTES

- El backend y frontend se comunican por HTTP.
- El backend filtra los microservicios por usuario autenticado.
- El acceso como "Invitado" usa credenciales del .env para autenticación Roble.
- Los microservicios se almacenan y gestionan en la carpeta `Backend/historial`.
- El archivo `docker-compose.yml` permite levantar todo el stack fácilmente.
- Recuerda crear tu propio archivo `.env` en la carpeta Backend antes de iniciar los contenedores.
