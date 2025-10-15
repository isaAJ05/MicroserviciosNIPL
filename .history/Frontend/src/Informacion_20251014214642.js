

import "./App.css"
import { useEffect, useState, useRef } from "react"

function Informacion({ onBack, section, onSectionChange, isHistoryOpen, setIsHistoryOpen, sidebarRef }) {


  const codeStyle = {
    background: "#1c1c1c",
    color: "#e6ccccff",
    padding: 16,
    borderRadius: 8,
    fontSize: 14,
    overflowX: "auto",
    border: "3px solid #9b0018",
  }
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = sessionStorage.getItem("lightTheme")
    return saved === "true"
  })
  const userPanelRef = useRef(null)
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [userPanelFade, setUserPanelFade] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRenewTokenToast, setShowRenewTokenToast] = useState(false)

  //CLIC FUERA DE MENU USER

  useEffect(() => {
    function handleClickOutside(event) {
      if (userPanelRef.current && !userPanelRef.current.contains(event.target)) {
        setShowUserPanel(false)
      }
    }

    if (showUserPanel) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserPanel])

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsHistoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [sidebarRef, setIsHistoryOpen])



  return (
    <div
      className="app-container"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#131313" }}
    >
      {/* NAVBAR */}
      <nav className="navbar">
        <button className="toggle-history-btn" onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          title="Menú Info">
          {isHistoryOpen ? "☰" : "☰"}
        </button>
        <button
          onClick={onBack}
          title="Volver al panel principal"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            marginLeft: 10,
          }}
        >
          {/* Icono de casita */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 21V10.5zM9 21V12h6v9" />
          </svg>
          <img src="/red_logo_OSWIDTH.png" alt="Logo MicroServicios" style={{ height: 44, borderRadius: 12 }} />
        </button>
        <h1>Información</h1>
        <button
          style={{
            marginLeft: "auto",
            background: lightTheme ? "#fff" : "#131313",
            color: lightTheme ? "#323232" : "#fff",
            border: "none",
            borderRadius: 50,
            padding: 8,
            fontWeight: 600,
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "none",
            transition: "background 0.3s, color 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          onClick={() => setShowUserPanel((v) => !v)}
          title="Usuario"
          onMouseOver={(e) => (e.currentTarget.style.background = "#323232")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#131313")}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
          </svg>
        </button>
        {showUserPanel && (
          <div
            ref={userPanelRef}
            style={{
              position: "absolute",
              top: 48,
              right: 0,
              background: lightTheme ? "#fff" : "#131313",
              color: lightTheme ? "#323232" : "#fff",
              border: `1.5px solid ${lightTheme ? "#9b0018" : "#fff"}`,
              borderRadius: 8,
              boxShadow: "0 4px 24px #000a",
              minWidth: 180,
              zIndex: 100,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
              {(user && (user.username || user.name || user.email)) || "Invitado"}
            </div>
            <div
              style={{ fontSize: 13, color: lightTheme ? "#656d76" : "#b3b3b3", marginBottom: 6, marginLeft: 28 }}
            >
              Project ID: {sessionStorage.getItem("tokenContract") || "N/A"}
            </div>
            <button
              style={{
                background: "#ff9696",
                color: "#131313",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: "background 0.2s",
                marginBottom: 8,
              }}
              onClick={async () => {
                try {
                  const email = ((user && (user.username || user.name || user.email)) || "").trim().toLowerCase()
                  const pass = sessionStorage.getItem("userPassword") || "" // Obtener la contraseña guardada
                  const token = sessionStorage.getItem("tokenContract") || ""
                  const res = await fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email,
                      password: pass,
                      token_contract: token,
                    }),
                  })
                  const data = await res.json()
                  if (res.ok && data.accessToken) {
                    sessionStorage.setItem("accessToken", data.accessToken)
                    setShowRenewTokenToast(true)
                    setTimeout(() => setShowRenewTokenToast(false), 2000)
                  } else {
                    alert(data.error || "No se pudo renovar el token")
                  }
                } catch (err) {
                  alert("No se pudo conectar con el backend")
                }
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f77777")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#ff9696")}
            >
              Renovar token
            </button>
            <button
              style={{
                background: "#9b0018",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => {
                setIsLoggedIn(false)
                setUserPanelFade(true)
                setTimeout(() => {
                  setShowUserPanel(false)
                  setUserPanelFade(false)
                  setUser(null)
                  sessionStorage.removeItem("user")
                }, 350)
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#680010")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#9b0018")}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>


      <aside ref={sidebarRef} className={`side-menu${isHistoryOpen ? " open" : ""}`}>
        <div className="sidebar-controls">
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} title={isHistoryOpen ? "Cerrar" : "Abrir"}>
            ❌
          </button>
        </div>
        {isHistoryOpen && (
          <ul className="sidebar-list">
            {/* "Información" como texto normal */}
            <div style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 8,
              color: "#ffffffff",
              cursor: "default"
            }}>
              Información
            </div>
            <li
              style={{
                cursor: "pointer",
                paddingLeft: 16,
                background: section === "descripcion" ? "#9b0018" : "transparent",
                color: "white",
                fontWeight: section === "descripcion" ? "bold" : "normal",
                borderLeft: "3px solid #1c1c1c",
              }}
              onMouseEnter={(e) => {
                if (section !== "descripcion") {
                  e.target.style.background = "rgba(155,0,24,0.2)";
                  e.target.style.borderLeft = "3px solid #9b0018";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.borderLeft = "3px solid #1c1c1c";
                if (section !== "descripcion") {
                  e.target.style.background = "transparent";

                }
              }}
              onClick={() => onSectionChange("descripcion")}
            >
              <span role="img" aria-label="descripción" style={{ fontSize: 20 }}>
                📋
              </span>{" "}
              Descripción
            </li>

            <li
              style={{
                cursor: "pointer",
                paddingLeft: 16,
                background: section === "instrucciones" ? "#9b0018" : "transparent",
                color: "white",
                fontWeight: section === "instrucciones" ? "bold" : "normal",
                borderLeft: "3px solid #1c1c1c",
              }}
              onMouseEnter={(e) => {
                if (section !== "instrucciones") {
                  e.target.style.background = "rgba(155,0,24,0.2)";
                  e.target.style.borderLeft = "3px solid #9b0018";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.borderLeft = "3px solid #1c1c1c";
                if (section !== "instrucciones") {
                  e.target.style.background = "transparent";

                }
              }}
              onClick={() => onSectionChange("instrucciones")}
            >
              <span role="img" aria-label="instrucciones" style={{ fontSize: 20 }}>
                ⚙️
              </span>{" "}
              Instrucciones
            </li>
            <li
              style={{
                cursor: "pointer",
                paddingLeft: 16,
                background: section === "roble" ? "#9b0018" : "transparent",
                color: "white",
                fontWeight: section === "roble" ? "bold" : "normal",
                borderLeft: "3px solid #1c1c1c",
              }}
              onMouseEnter={(e) => {
                if (section !== "roble") {
                  e.target.style.background = "rgba(155,0,24,0.2)";
                  e.target.style.borderLeft = "3px solid #9b0018";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.borderLeft = "3px solid #1c1c1c";
                if (section !== "roble") {
                  e.target.style.background = "transparent";

                }
              }}
              onClick={() => onSectionChange("roble")}
            >
              <span role="img" aria-label="roble" style={{ fontSize: 20 }}>
                🔐
              </span>{" "}
              Roble
            </li>
            <li
              style={{
                cursor: "pointer",
                paddingLeft: 16,
                background: section === "ejemplos" ? "#9b0018" : "transparent",
                color: "white",
                fontWeight: section === "ejemplos" ? "bold" : "normal",
                borderLeft: "3px solid #1c1c1c",
              }}
              onMouseEnter={(e) => {
                if (section !== "ejemplos") {
                  e.target.style.background = "rgba(155,0,24,0.2)";
                  e.target.style.borderLeft = "3px solid #9b0018";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.borderLeft = "3px solid #1c1c1c";
                if (section !== "ejemplos") {
                  e.target.style.background = "transparent";

                }
              }}
              onClick={() => onSectionChange("ejemplos")}
            >
              <span role="img" aria-label="ejemplos" style={{ fontSize: 20 }}>
                🧪
              </span>{" "}
              Ejemplos
            </li>
            <li
              style={{
                cursor: "pointer",
                paddingLeft: 16,
                background: section === "equipo" ? "#9b0018" : "transparent",
                color: "white",
                fontWeight: section === "equipo" ? "bold" : "normal",
                borderLeft: "3px solid #1c1c1c",
              }}
              onMouseEnter={(e) => {
                if (section !== "equipo") {
                  e.target.style.background = "rgba(155,0,24,0.2)";
                  e.target.style.borderLeft = "3px solid #9b0018";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.borderLeft = "3px solid #1c1c1c";
                if (section !== "equipo") {
                  e.target.style.background = "transparent";

                }
              }}
              onClick={() => onSectionChange("equipo")}
            >
              <span role="img" aria-label="equipo" style={{ fontSize: 20 }}>
                👥
              </span>{" "}
              Equipo
            </li>
          </ul>
        )}
      </aside>

      <div style={{ flex: 1, overflowY: "auto", background: "#131313" }}>
        <div
          className="info-page"
          style={{ padding: 32, maxWidth: 1200, margin: "0 auto", fontSize: 17, color: "#fff" }}
        >
          {/* DESCRIPCIÓN SECTION */}
          {section === "descripcion" && (
            <>
              <h1 style={{ marginBottom: 10, color: "#ffffffff" }}>🍁 Oak Services</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                <img
                  src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"
                  alt="Docker"
                />
                <img
                  src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"
                  alt="Flask"
                />
                <img
                  src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"
                  alt="React"
                />
                <img
                  src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"
                  alt="Python"
                />
                <img
                  src="https://img.shields.io/badge/Roble-000000?style=for-the-badge&logoColor=white"
                  alt="Roble"
                />
              </div>
              <hr style={{ borderColor: "#9b0018", opacity: 3 }} />
              <h2 style={{ color: "#ffffffff" }}>🪵 Descripción general</h2>
              <p>
                <b>Oak Services</b> es una plataforma web que permite a los usuarios{" "}
                <b>crear, editar, eliminar y listar microservicios</b> de manera segura y aislada, con{" "}
                <b>autenticación Roble</b>, gestión de usuarios y <b>despliegue automático en contenedores Docker</b>.
              </p>
              <ul>
                <li>
                  <b>Frontend en React</b>
                </li>
                <li>
                  <b>Backend en Flask</b>
                </li>
                <li>
                  <b>Orquestación con Docker Compose</b>
                </li>
              </ul>
              <p>
                Cada usuario puede administrar <b>únicamente sus propios microservicios</b>, los cuales se ejecutan en
                contenedores Docker independientes y validados automáticamente con Roble.
              </p>
              <>
                <hr style={{ borderColor: "#9b0018", opacity: 3, marginTop: 24 }} />
                <h2 style={{ color: "#ffffffff", marginTop: 24 }}>🏗️ Diagrama de Arquitectura</h2>
               
                  <div style={{ textAlign: "left", marginBottom: 12 }}>
                    <p style={{ color: "#ffffffff", fontSize: 17, marginBottom: 24 }}>
                      Diagrama de arquitectura de Oak Services realizado en Enterprise Architect,
                      mostrando la interacción entre el frontend, backend, Docker y Roble.
                    </p>

                    <img
                      src="/Diagrama_Arquitectura.png"
                      alt="Diagrama de Arquitectura"
                      style={{ maxWidth: "100%", height: "auto", borderRadius: 8, border: "2px solid #9b0018" }}
                    />
                  </div>

               
              </>
            </>
          )}

          {/* INSTRUCCIONES SECTION */}
          {section === "instrucciones" && (
            <>
              <h1 style={{ color: "#ffffffff" }}>⚙️ Instrucciones de uso</h1>
              <hr style={{ borderColor: "#9b0018", opacity: 3 }} />
              <h3 style={{ color: "#ffffffff" }}>🧱 Requisitos previos</h3>
              <ul>
                <li>
                  Tener <b>Docker</b> y <b>Docker Compose</b> instalados.
                </li>
                <li>
                  Contar con un archivo{" "}
                  <code style={{ background: "#323232", padding: "2px 6px", borderRadius: 4 }}>.env</code> válido en
                  la carpeta{" "}
                  <code style={{ background: "#323232", padding: "2px 6px", borderRadius: 4 }}>Backend</code>{" "}
                  (requerido para el acceso como invitado).
                </li>
              </ul>
              <h3 style={{ color: "#ffffffff" }}>🚀 Configuración rápida</h3>
              <pre style={codeStyle}>
                {`# 1️⃣ Clonar el repositorio
git clone https://github.com/isaAJ05/Oak-Services-NIPL.git
cd Oak-Services-NIPL


# 2️⃣ Construir y ejecutar contenedores
docker compose up --build`}
              </pre>
              <p>Accede a:</p>
              <ul>
                <li>
                  Frontend:{" "}
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#ff9696" }}
                  >
                    http://localhost:3000
                  </a>
                </li>
                <li>
                  Backend:{" "}
                  <a
                    href="http://localhost:5000"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#ff9696" }}
                  >
                    http://localhost:5000
                  </a>
                </li>
              </ul>
              <hr style={{ borderColor: "#9b0018", opacity: 3 }} />
              <h3 style={{ color: "#ffffffff" }}>🌐 Uso general de la plataforma</h3>
              <ol>
                <li>
                  Abre <b>http://localhost:3000</b> en tu navegador.
                </li>
                <li>
                  Inicia sesión con tus credenciales de <b>Roble</b> o accede como <b>Invitado</b>.
                </li>
                <li>Visualiza la tabla de microservicios con sus campos:</li>
              </ol>
              <table
                style={{ borderCollapse: "collapse", width: "100%", marginBottom: 18, border: "2px solid #9b0018" }}
              >
                <thead>
                  <tr style={{ background: "#1c1c1c" }}>
                    <th style={{ border: "2px solid #9b0018", padding: 8, color: "#ffffffff" }}>Campo</th>
                    <th style={{ border: "2px solid #9b0018", padding: 8, color: "#ffffffff" }}>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>🧩 Nombre</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>Identificador del microservicio</td>
                  </tr>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>⚙️ Tipo de procesamiento</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>Hola Mundo/ Suma/ Consulta Roble</td>
                  </tr>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>🆔 ID</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>Identificador único</td>
                  </tr>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>🔌 Puerto</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>Puerto Docker asignado</td>
                  </tr>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>📶 Estado</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>Activo / Inactivo</td>
                  </tr>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>🌎 Endpoint</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>URL local o remota</td>
                  </tr>
                  <tr>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>🧭 Acciones</td>
                    <td style={{ border: "2px solid #9b0018", padding: 8 }}>Ver, Editar, Eliminar</td>
                  </tr>
                </tbody>
              </table>
              <h4 style={{ color: "#ffffffff" }}>Acciones disponibles:</h4>
              <ul>
                <li>🔄 Recargar Tabla</li>
                <li>➕ Crear microservicio</li>
                <li>✏️ Editar</li>
                <li>👁️ Ver código</li>
                <li>❌ Eliminar</li>
                <li>🔗 Probar endpoint</li>
                <li>🔁 Renovar Token</li>
              </ul>
              <div
                style={{
                  fontSize: 15,
                  color: "#ff9696",
                  marginTop: 10,
                  padding: 12,
                  background: "#323232",
                  borderRadius: 8,
                  border: "2px solid #9b0018",
                }}
              >
                <b>⚠️ Nota importante:</b> Para probar un <b>endpoint</b>, el <b>token Roble</b> debe estar{" "}
                <b>activo y vigente</b>.<br />
                Si el token ha expirado, utiliza la opción <b>Renovar Token</b> para obtener uno nuevo antes de
                continuar.
              </div>
              <hr style={{ borderColor: "#9b0018", opacity: 3, marginTop: 24 }} />
              <h3 style={{ color: "#ffffffff" }}>🧩 Crear o editar un microservicio</h3>
              <ol>
                <li>
                  Asigna un <b>nombre</b> al microservicio.
                </li>
                <li>
                  Selecciona el <b>tipo de procesamiento</b> (p. ej. Hola Mundo, Suma o Consulta Roble).
                </li>
                <li>
                  (Opcional) Escoge un <b>ejemplo de código predefinido</b>.
                </li>
                <li>
                  Escribe o modifica tu código directamente en el <b>editor integrado</b>.
                </li>
                <li>
                  Haz clic en <b>Crear</b> para desplegarlo en un contenedor <b>Docker</b>.
                </li>
              </ol>
            </>
          )}

          {/* ROBLE SECTION */}
          {section === "roble" && (
            <>
              <h1 style={{ color: "#ffffffff" }}>🔐 Validación automática con Roble</h1>
              <hr style={{ borderColor: "#9b0018", opacity: 3 }} />
              <h3 style={{ color: "#ffffffff" }}>¿Qué es Roble?</h3>
              <p>
                <b>Roble</b> es una plataforma tecnológica creada por <b>OPENLAB – Universidad del Norte</b>, que
                ofrece autenticación centralizada y gestión de bases de datos para proyectos académicos y de
                innovación.
              </p>
              <p>
                Utiliza <b>JWT (JSON Web Tokens)</b> y un sistema de verificación por tokens seguros para permitir que
                las aplicaciones validen usuarios sin necesidad de manejar credenciales directamente.
              </p>
              <p>
                Cada microservicio creado en <b>Oak Services</b> se genera con código Flask que incluye esta{" "}
                <b>validación automática de Roble</b>, asegurando que solo usuarios autenticados puedan ejecutar sus
                servicios.
              </p>
              <h4 style={{ color: "#ffffffff", marginTop: 24 }}>🔧 Función generadora en el backend</h4>
              <pre style={{ ...codeStyle, lineHeight: 1.5 }}>
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
            return jsonify({"status": "error", "message": "Token de autenticación requerido"}), 401
    token = auth_header.replace('Bearer ', '').strip()

    token_contract = request.headers.get('Token-Contract') or request.args.get('token_contract')
    if not token_contract:
         return jsonify({"status": "error", "message": "Token contract no recibido"}), 400

    # Verificar el token con la API de Roble
    res = requests.get(
         f"https://roble-api.openlab.uninorte.edu.co/auth/{token_contract}/verify-token",
        headers={"Authorization": f"Bearer {token}"}
    )

    if res.status_code != 200:
       return jsonify({"status": "error", "message": "Token inválido o expirado"}), res.status_code

    # Ejecutar la función principal del usuario
    data = request.get_json() if request.method == 'POST' else dict(request.args)
    data['roble_token'] = token
    data['token_contract'] = token_contract

    try:
        resultado = {nombre_funcion}(data)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
'''`}
              </pre>
              <div
                style={{
                  fontSize: 15,
                  color: "#ffffffff",
                  marginTop: 12,
                  padding: 12,
                  background: "#323232",
                  borderRadius: 8,
                  border: "3px solid #9b0018",
                }}
              >
                ✅ Así, cada microservicio desplegado valida el token Roble antes de ejecutar cualquier operación.
              </div>
            </>
          )}

          {/* EJEMPLOS SECTION */}
          {section === "ejemplos" && (
            <>
              <h1 style={{ color: "#ffffffff" }}>🧪 Ejemplos de solicitudes</h1>
              <hr style={{ borderColor: "#9b0018", opacity: 3 }} />

              <h3 style={{ color: "#ffffffff" }}>1️⃣ Hola Mundo</h3>
              <h4 style={{ color: "#ffffffff" }}>Código:</h4>
              <pre style={codeStyle}>
                {`def main(data=None):
    """
    Devuelve un saludo simple.
    """
    return {
        "status": "success",
        "message": \"Hola mundo desde el microservicio!"
    }`}
              </pre>
              <h4 style={{ color: "#ffffffff" }}>Respuesta:</h4>
              <pre style={codeStyle}>
                {`GET http://localhost:32768/hola

{
  "message": \"Hola mundo desde el microservicio!",
  "status": "success"
}`}
              </pre>

              <hr style={{ borderColor: "#9b0018", opacity: 3, margin: "32px 0" }} />

              <h3 style={{ color: "#ffffffff" }}>2️⃣ Suma de dos números</h3>
              <h4 style={{ color: "#ffffffff" }}>Código:</h4>
              <pre style={codeStyle}>
                {`# Microservicio Suma
# Los parámetros 'a' y 'b' se pasan en la URL como /?a=5&b=3

def main(data=None):
    """
    Suma dos números recibidos por parámetro.
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
        }`}
              </pre>
              <h4 style={{ color: "#ffffffff" }}>Respuesta:</h4>
              <pre style={{ ...codeStyle, maxHeight: 400 }}>
                {`GET http://localhost:32769/suma?a=5&b=3

{
  "inputs": {
    "a": 5,
    "b": 3
  },
  "status": "success",
  "suma": 8
}`}
              </pre>

              <hr style={{ borderColor: "#9b0018", opacity: 3, margin: "32px 0" }} />

              <h3 style={{ color: "#ffffffff" }}>3️⃣ Consultar tabla en Roble</h3>
              <h4 style={{ color: "#ffffffff" }}>Código:</h4>
              <pre style={{ ...codeStyle, maxHeight: 400 }}>
                {`# Microservicio Consulta Tabla Roble
def main(data=None):
    """
    Consulta una tabla en Roble usando el token recibido.
    """
    import requests
    from flask import request

    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return {"status": "error", "message": "Token requerido"}
    token = auth_header.replace('Bearer ', '').strip()

    token_contract = request.headers.get('Token-Contract') or request.args.get('token_contract')
    if not token_contract:
        return {"status": "error", "message": "Token contract no recibido"}

    table_name = request.args.get("tableName") or "inventario"
    params = {"tableName": table_name}

    res = requests.get(
        f"https://roble-api.openlab.uninorte.edu.co/database/{token_contract}/read",
        headers={"Authorization": f"Bearer {token}"},
        params=params
    )
    
    if res.status_code == 200:
        return {"status": "success", "roble_data": res.json()}
    else:
        return {"status": "error", "message": f"Roble error: {res.status_code}"}
`}
              </pre>
              <h4 style={{ color: "#ffffffff" }}>Respuesta:</h4>
              <pre style={{ ...codeStyle, maxHeight: 300 }}>
                {`GET http://localhost:32770/roble_table?tableName=eventos_demo

{
  "roble_data": [
    {
      "_id": "baD5ow7kmsJn",
      "cupos": 200,
      "descripcion": "Charla de bienvenida...",
      "nombre": "Bienvenida a Nuevos Estudiantes",
      ...
    },
    ...
  ],
  "status": "success"
}`}
              </pre>
            </>
          )}

          {/* EQUIPO SECTION */}
          {section === "equipo" && (
            <>
              <h1 style={{ color: "#ffffffff" }}>👥 Equipo de Desarrollo</h1>
              <hr style={{ borderColor: "#9b0018", opacity: 3 }} />
              <h3 style={{ color: "#ffffffff" }}>🤝 Créditos</h3>
              <p>Este proyecto fue desarrollado por:</p>
              <ul style={{ fontSize: 18, lineHeight: 2 }}>
                <li>
                  <b>Natalia Carpintero</b>
                </li>
                <li>
                  <b>Isabella Arrieta</b>
                </li>
                <li>
                  <b>Paula Núñez</b>
                </li>
                <li>
                  <b>Luis Robles</b>
                </li>
              </ul>
              <p style={{ marginTop: 24 }}>
                Proyecto desarrollado para la clase de <b>Estructura del Computador II</b> en la{" "}
                <b>Universidad del Norte</b>.
              </p>
              <hr style={{ borderColor: "#9b0018", opacity: 3, marginTop: 32 }} />
              <h3 style={{ color: "#ffffffff" }}>📧 Contacto</h3>
              <p>
                Para más información o soporte, contáctanos en:{" "}

                <a href=" mailto:oakservicesglobal@gmail.com" style={{ color: "#ff9696", fontWeight: 600 }}>
                  oakservicesglobal@gmail.com
                </a>
              </p>
              <div
                style={{
                  marginTop: 32,
                  padding: 20,
                  background: "#1c1c1c",
                  borderRadius: 8,
                  border: "2px solid #9b0018",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 18, margin: 0 }}>Oak Services &copy; 2025</p>
                <p style={{ fontSize: 14, color: "#ff9696", marginTop: 8 }}>
                  Desarrollado con ♥️ por el equipo de Oak Services
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>


  )




}

export default Informacion