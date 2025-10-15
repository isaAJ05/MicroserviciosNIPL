import React, { useState, useRef, useEffect } from 'react';
import './App.css';
// Importar CodeMirror para el editor de código
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from "@codemirror/state";

function createEditorTheme(lightTheme) {

  return EditorView.theme({
    "&": {
      height: "100%",
      border: "none",
      background: lightTheme ? "#fff" : "#1c1c1c",
      fontSize: "14px",
    },
    ".cm-content": {
      padding: "16px 20px",
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
      fontSize: "14px",
      lineHeight: "1.45",
      color: lightTheme ? "#1f2328" : "#e6edf3",
      minHeight: "100%",
    },
    ".cm-editor": { height: "100%" },
    ".cm-focused": { outline: "none" },
    ".cm-gutters": {
      backgroundColor: lightTheme ? "#f6f8fa" : "#1c1c1c",
      color: lightTheme ? "#656d76" : "#7d8590",
      border: "none",
      paddingRight: "16px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: lightTheme ? "#fff" : "#161b22",
    },
    ".cm-activeLine": {
      backgroundColor: lightTheme ? "#f6f8fa" : "#161b2240",
    },
    ".cm-selectionMatch": {
      backgroundColor: lightTheme ? "#ffd33d33" : "#ffd33d44",
    },
    ".cm-searchMatch": {
      backgroundColor: lightTheme ? "#ffdf5d33" : "#ffdf5d44",
    },
    ".cm-cursor": {
      borderLeftColor: lightTheme ? "#1f2328" : "#e6edf3",
    },
    ".cm-scroller": { overflow: "auto" },
  });
}

function PythonEditor({ code, setCode, lightTheme }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // Compartimento para tema y config dinámica
  const themeCompartment = useRef(new Compartment());

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          python(),
          themeCompartment.current.of([
            createEditorTheme(lightTheme),
            ...(lightTheme ? [] : [oneDark]),
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setCode(update.state.doc.toString());
            }
          }),
        ],
      });
      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });
    }
  }, [lightTheme]);

  // Sincronizar código externo
  useEffect(() => {
    if (viewRef.current) {
      const currentCode = viewRef.current.state.doc.toString();
      if (currentCode !== code) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentCode.length, insert: code },
        });
      }
    }
  }, [code]);

  return (
    <div
      ref={editorRef}
      style={{
        height: "100%",
        width: "100%",
        background: lightTheme ? "#fff" : "#1c1c1c",
        overflow: "hidden",
      }}
    />
  );
}
const ejemplosCodigo = {
  "hola_mundo": `def main(data=None):
    """
    Devuelve un saludo simple.
    """
    return {
        "status": "success",
        "message": "Hola mundo desde el microservicio!"
    }
`,

  "suma": `# Microservicio Suma
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
`,

  "consulta_roble": `# Microservicio Consulta Tabla Roble
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
`
};
function AgregarMicroservicio({ onBack, lightTheme }) {
  const savedUser = sessionStorage.getItem("user");
  const [showInfoPage, setShowInfoPage] = useState(false)
  const [infoSection, setInfoSection] = useState("descripcion")
  const [microservices, setMicroservices] = useState([])
  const [editId, setEditId] = useState(null)
  const userPanelRef = useRef(null)
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [userPanelFade, setUserPanelFade] = useState(false)
  const [user, setUser] = useState(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddMicroservice, setShowAddMicroservice] = useState(false)
  const [newMicroservice, setNewMicroservice] = useState({
    name: "",
    processing_type: "",
    code: "",
  })
  const [dockerActive, setDockerActive] = useState(null) // verificacion
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [codeToShow, setCodeToShow] = useState("")
  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginFade, setLoginFade] = useState(false)
  // Para la sidebar
  const [isPinned, setIsPinned] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sidebarRef = useRef(null)
  // Para modal de respuesta de endpoint
  const [showEndpointModal, setShowEndpointModal] = useState(false)
  const [endpointResponse, setEndpointResponse] = useState(null)
  const [endpointUrl, setEndpointUrl] = useState("")
  // Para modal personalizado de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [microserviceToDelete, setMicroserviceToDelete] = useState(null)
  // Para toast de éxito (eliminación)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  // Para toast de éxito (renovación de token)
  const [showRenewTokenToast, setShowRenewTokenToast] = useState(false)
  // Estado para modal de edición de URL de endpoint
  const [showEditEndpointUrlModal, setShowEditEndpointUrlModal] = useState(false)
  const [editEndpointUrlValue, setEditEndpointUrlValue] = useState("")

  let email = "";
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      email = userObj.email || "Invitado";
    } catch (e) {
      email = "Invitado";
    }
  }
  const [microservice, setMicroservice] = useState({
    name: "",
    processing_type: "",
    use_roble_auth: false,
    code: `# Microservicio Python
# Escribe tu código personalizado aquí

def main(data=None):
    """
    Función principal del microservicio
    
    Args:
        data: Datos de entrada (opcional)
        
    Returns:
        dict: Resultado del procesamiento
    """
    try:
        # Tu lógica de procesamiento aquí
        result = {
            "status": "success",
            "message": "Microservicio ejecutado correctamente",
            "data": data
        }
        
        return result
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Error en el microservicio: {str(e)}"
        }`
  });
  useEffect(() => {
    console.log('[DEBUG] microservice changed:', microservice);
  }, [microservice]);
  const [ejemploSeleccionado, setEjemploSeleccionado] = useState("");

  const handleEjemploChange = (e) => {
    const value = e.target.value;
    setEjemploSeleccionado(value);
    if (ejemplosCodigo[value]) {
      setMicroservice(prev => ({ ...prev, code: ejemplosCodigo[value] }));
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!microservice.name.trim() || !microservice.processing_type.trim() || !microservice.code.trim()) {
      setError("El nombre, tipo de procesamiento y código son obligatorios");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem('accessToken');



      const res = await fetch('http://127.0.0.1:5000/microservices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: microservice.name,
          endpoint: microservice.name.toLowerCase().replace(/\s+/g, '_'),
          processing_type: microservice.processing_type,
          description: microservice.description,
          use_roble_auth: microservice.use_roble_auth,
          code: microservice.code,
          user: email
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("¡Microservicio creado exitosamente!");
        setTimeout(() => {
          onBack(); // Regresar al panel principal
        }, 2000);
      } else {
        setError(data.error || "Error al crear el microservicio");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCode = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch('http://127.0.0.1:5000/test-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: microservice.code })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Salida:\n" + (data.output || "") + (data.error ? "\nError:\n" + data.error : ""));
      } else {
        setError(data.error || "Error al probar el código");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  // Determinar si la configuración está completa
  const configCompleta = microservice.name.trim() && microservice.processing_type.trim() && microservice.code.trim();

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

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{
      height: '100vh', // Cambiado de minHeight a height
      display: 'flex',
      flexDirection: 'column',
      background: lightTheme ? '#f8f9fa' : '#323232'
    }}>
      <nav className="navbar">
        <button
          className="toggle-history-btn"
          onClick={onBack}
          title="Volver al panel principal"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {/* Icono de casita */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 21V10.5zM9 21V12h6v9" />
          </svg>
          <img
            src="/red_logo_OSWIDTH.png"
            alt="Logo MicroServicios"
            style={{ height: 44, marginLeft: 12, borderRadius: 12 }}
          />
        </button>
        <h1>Crear Microservicio</h1>
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

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Panel izquierdo - Configuración */}
        <div style={{
          width: '380px', // Aumentado de 340px a 380px
          background: lightTheme ? '#fff' : '#131313',
          borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#1c1c1c'}`,
          padding: '20px 16px', // Reducido padding
          overflow: 'hidden', // Sin scroll
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header de configuración - más compacto */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16, // Reducido
            paddingBottom: 12, // Reducido
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#1c1c1c'}`,
            flexShrink: 0
          }}>
            <div style={{
              width: 28, // Reducido
              height: 28, // Reducido
              borderRadius: '50%',
              background: '#ff9696',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#131313',
              fontSize: 13, // Reducido
              fontWeight: 700
            }}>
              1
            </div>
            <span style={{
              fontWeight: 600,
              fontSize: 15, // Reducido
              color: lightTheme ? '#1f2328' : '#fff'
            }}>
              Configuración
            </span>
            <div style={{
              width: 18, // Reducido
              height: 18, // Reducido
              borderRadius: '50%',
              background: configCompleta ? '#34d399' : (lightTheme ? '#e1e4e8' : '#23272e'),
              border: configCompleta ? 'none' : `2px solid ${lightTheme ? '#b1b1b1' : '#444'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto',
              transition: 'background 0.2s, border 0.2s'
            }}>
              {configCompleta ? (
                <svg width="10" height="10" fill="#fff" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              ) : null}
            </div>
          </div>

          {/* Formulario - más compacto */}
          <div style={{ flex: 1, overflow: 'hidden', padding: 6 }}>
            <form onSubmit={handleSubmit}>
              {/* Nombre del microservicio */}
              <div style={{ marginBottom: 16 }}> {/* Reducido */}
                <label style={{
                  display: 'block',
                  marginBottom: 6, // Reducido
                  fontWeight: 500,
                  fontSize: 13, // Reducido
                  color: lightTheme ? '#656d76' : '#8b949e'
                }}>
                  Nombre del microservicio *
                </label>
                <input
                  type="text"
                  value={microservice.name}
                  onChange={e => {
                    console.log('[DEBUG] input change name:', e.target.value);
                    setMicroservice(prev => ({ ...prev, name: e.target.value }));
                  }}

                  placeholder="mi_microservicio"
                  style={{
                    width: '95%',
                    padding: '7px 10px', // Reducido
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                    borderRadius: 4, // Reducido
                    background: lightTheme ? '#fff' : '#1c1c1c',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13, // Reducido
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                  }}
                  required
                />
                <div style={{
                  marginTop: 4, // Reducido
                  color: lightTheme ? '#656d76' : '#8b949e',
                  fontSize: 11 // Reducido
                }}>
                  Nombre identificador del microservicio
                </div>
              </div>

              {/* Tipo de procesamiento */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: 13,
                  color: lightTheme ? '#656d76' : '#8b949e'
                }}>
                  Tipo de Procesamiento *
                </label>
                <select
                  value={microservice.processing_type}
                  onChange={e => setMicroservice(prev => ({
                    ...prev,
                    processing_type: e.target.value,
                    use_roble_auth: e.target.value === "Consulta Roble" // Si selecciona Consulta Roble, activa el flag
                  }))}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#1c1c1c',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13
                  }}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Hola Mundo">Hola Mundo</option>
                  <option value="Suma">Suma</option>
                  <option value="Consulta Roble">Consulta Roble</option>
                </select>
              </div>

              {/* Selector de ejemplo de código */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: 13,
                  color: lightTheme ? '#656d76' : '#8b949e'
                }}>
                  Ejemplo de código
                </label>
                <select
                  value={ejemploSeleccionado}
                  onChange={handleEjemploChange}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#1c1c1c',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13
                  }}
                >
                  <option value="">Selecciona un ejemplo</option>
                  <option value="hola_mundo">Hola Mundo (respuesta simple)</option>
                  <option value="suma">Suma (dos números)</option>
                  <option value="consulta_roble">Consulta Tabla Roble (API externa)</option>
                </select>
                <div style={{
                  marginTop: 4,
                  color: lightTheme ? '#656d76' : '#8b949e',
                  fontSize: 11
                }}>
                  Selecciona un ejemplo para cargar una plantilla de código en el editor.
                  <div style={{
                    marginTop: 8,
                    marginBottom: 24,
                    color: lightTheme ? '#b59b00' : '#ffe066',
                    background: lightTheme ? '#fffbe6' : '#3a3a1c',
                    borderRadius: 4,
                    padding: '7px 10px',
                    fontWeight: 500,
                    fontSize: 12
                  }}>
                    Nota: Todos los microservicios generados validan el token de Roble automáticamente. Si el token es inválido, expirado o falta, la petición será rechazada con el mensaje y código HTTP correspondiente.
                  </div>
                </div>
              </div>
              {/* Mensajes de estado */}
              {error && (
                <div style={{
                  color: '#f85149',
                  background: lightTheme ? '#ffebe9' : '#490202',
                  border: `1px solid ${lightTheme ? '#ffb3ba' : '#f85149'}`,
                  borderRadius: 4, // Reducido
                  padding: 10, // Reducido
                  marginBottom: 12, // Reducido
                  fontSize: 12 // Reducido
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  color: '#238636',
                  background: lightTheme ? '#dafbe1' : '#0f5132',
                  border: `1px solid ${lightTheme ? '#34d399' : '#238636'}`,
                  borderRadius: 4, // Reducido
                  padding: 10, // Reducido
                  marginBottom: 12, // Reducido
                  fontSize: 12 // Reducido
                }}>
                  {success}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Panel derecho - Editor de código */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header del código */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 20px', // Reducido
            background: lightTheme ? '#fff' : '#131313',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#131313'}`,
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, // Reducido
                height: 28, // Reducido
                borderRadius: '50%',
                background: '#ff9696',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#131313',
                fontSize: 13, // Reducido
                fontWeight: 700
              }}>
                2
              </div>
              <span style={{
                fontWeight: 600,
                fontSize: 15, // Reducido
                color: lightTheme ? '#1f2328' : '#fff'
              }}>
                Código
              </span>
            </div>
          </div>

          {/* Editor */}
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <PythonEditor
              code={microservice.code}
              setCode={(code) => setMicroservice(prev => ({ ...prev, code }))}
              lightTheme={lightTheme}
            />
          </div>

          {/* Footer con botones */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px', // Reducido
            background: lightTheme ? '#f6f8fa' : '#131313',
            borderTop: `1px solid ${lightTheme ? '#e1e4e8' : '#1C1C1C'}`,
            flexShrink: 0
          }}>
            <div></div>
            <div style={{ display: 'flex', gap: 10 }}> {/* Reducido */}
              <button
                onClick={onBack}
                style={{
                  background: '#1c1c1c',
                  color: lightTheme ? '#e0e0e0ff' : '#e0e0e0ff',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                  borderRadius: 4,
                  padding: '7px 14px', // Reducido
                  fontSize: 13, // Reducido
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#323232')}
                onMouseOut={e => (e.currentTarget.style.background = '#1c1c1c')}
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  background: isLoading ? '#6c757d' : '#ff9696',
                  color: '#131313',
                  border: 'none',
                  borderRadius: 4,
                  padding: '7px 14px', // Reducido
                  fontSize: 13, // Reducido
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f77777')}
                onMouseOut={e => (e.currentTarget.style.background = '#ff9696')}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: 12, // Reducido
                      height: 12, // Reducido
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creando...
                  </>
                ) : (
                  'Crear'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - sin margenes adicionales */}
      <footer className="footer" style={{ margin: 0 }}>
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

export default AgregarMicroservicio;