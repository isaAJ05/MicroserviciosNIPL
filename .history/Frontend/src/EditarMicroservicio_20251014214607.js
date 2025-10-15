import React, { useState, useEffect, useRef } from "react";
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

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // Reconfigurar tema cuando cambia lightTheme
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.current.reconfigure([
          createEditorTheme(lightTheme),
          ...(lightTheme ? [] : [oneDark]),
        ]),
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


function EditarMicroservicio({ id, onBack, lightTheme = false }) {
  const [microservice, setMicroservice] = useState(null);
  const [form, setForm] = useState({
    name: "",
    processing_type: "",
    endpoint: "",
    port: "",
    code: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    fetch(`http://127.0.0.1:5000/microservices`)
      .then(res => res.json())
      .then(async data => {
        const ms = (data.microservices || []).find(m => m.id === id);
        if (ms) {
          setMicroservice(ms);
          // Intentar obtener el main.py completo si existe endpoint para ello
          let fullCode = ms.code;
          try {
            const res = await fetch(`http://127.0.0.1:5000/microservices/${ms.id}/mainpy`);
            if (res.ok) {
              const data = await res.json();
              if (data.code) fullCode = data.code;
            }
          } catch {}
          setForm({
            name: ms.name,
            processing_type: ms.processing_type,
            endpoint: ms.endpoint,
            port: ms.port,
            code: fullCode
          });
        }
      });
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCodeChange = code => {
    setForm(prev => ({ ...prev, code }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validar que los campos requeridos no estén vacíos
    if (!form.name.trim() || !form.endpoint.trim() || !form.port.toString().trim() || !form.code.trim()) {
      setError("Todos los campos de configuración y el código son obligatorios");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`http://127.0.0.1:5000/microservices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess("¡Microservicio editado exitosamente!");
        setTimeout(() => onBack(), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Error al editar el microservicio");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };


  if (!microservice) return (
    <div style={{
      height: '100vh',
      background: lightTheme ? '#f8f9fa' : '#323232',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: lightTheme ? '#323232' : '#fff',
      fontSize: 22,
      fontWeight: 600
    }}>
      Cargando...
    </div>
  );

 

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{
      height: '100vh',
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
        <h1>Editar Microservicio</h1>
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

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel izquierdo - Configuración */}
        <div style={{
          width: '380px',
          background: lightTheme ? '#fff' : '#131313',
          borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#1c1c1c'}`,
          padding: '20px 16px',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#1c1c1c'}`,
            flexShrink: 0
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#ff9696',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#131313',
              fontSize: 13,
              fontWeight: 700
            }}>
              1
            </div>
            <span style={{
              fontWeight: 600,
              fontSize: 15,
              color: lightTheme ? '#1f2328' : '#fff'
            }}>
              Editar Configuración
            </span>
          </div>

          <div style={{ flex: 1, overflow: 'hidden',padding: 6  }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: 13,
                  color: lightTheme ? '#656d76' : '#8b949e'
                }}>
                  Nombre del microservicio *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="mi_microservicio"
                  style={{
                    width: '95%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#1c1c1c',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                  }}
                  required
                />
              </div>
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
                <input
                  type="text"
                  name="processing_type"
                  value={form.processing_type}
                  onChange={handleChange}
                  placeholder="Tipo de procesamiento"
                  style={{
                    width: '95%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#1c1c1cff',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: 13,
                  color: lightTheme ? '#656d76' : '#8b949e'
                }}> <div style={{ marginBottom: 16 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: 6,
                      fontWeight: 500,
                      fontSize: 13,
                      color: lightTheme ? '#656d76' : '#8b949e'
                    }}>
                      Puerto *
                    </label>
                    <input
                      type="number"
                      name="port"
                      value={form.port}
                      onChange={handleChange}
                      placeholder="Ej: 32779"
                      style={{
                        width: '95%',
                        padding: '7px 10px',
                        border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                        borderRadius: 4,
                        background: lightTheme ? '#fff' : '#1c1c1c',
                        color: lightTheme ? '#1f2328' : '#e6edf3',
                        fontSize: 13
                      }}
                      required
                    />
                  </div>
                  Endpoint *
                </label>
                <input
                  type="text"
                  name="endpoint"
                  value={form.endpoint}
                  onChange={handleChange}
                  placeholder="Endpoint"
                  style={{
                    width: '95%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#1c1c1c',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13
                  }}
                  required
                />
              </div>
              {error && (
                <div style={{
                  color: '#f85149',
                  background: lightTheme ? '#ffebe9' : '#490202',
                  border: `1px solid ${lightTheme ? '#ffb3ba' : '#f85149'}`,
                  borderRadius: 4,
                  padding: 10,
                  marginBottom: 12,
                  fontSize: 12
                }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  color: '#238636',
                  background: lightTheme ? '#dafbe1' : '#0f5132',
                  border: `1px solid ${lightTheme ? '#34d399' : '#238636'}`,
                  borderRadius: 4,
                  padding: 10,
                  marginBottom: 12,
                  fontSize: 12
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: lightTheme ? '#fff' : '#131313',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#1c1c1c'}`,
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#ff9696',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#131313',
                fontSize: 13,
                fontWeight: 700
              }}>
                2
              </div>
              <span style={{
                fontWeight: 600,
                fontSize: 15,
                color: lightTheme ? '#1f2328' : '#fff'
              }}>
                Código
              </span>
            </div>
            {/* Botón 'Probar Función' eliminado */}
          </div>
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <PythonEditor
              code={form.code}
              setCode={handleCodeChange}
              lightTheme={lightTheme}
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: lightTheme ? '#f6f8fa' : '#131313',
            borderTop: `1px solid ${lightTheme ? '#e1e4e8' : '#1c1c1c'}`,
            flexShrink: 0
          }}>
            <div></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onBack}
                style={{
                  background: '#1c1c1c',
                  color: lightTheme ? '#e0e0e0ff' : '#e0e0e0ff',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#1c1c1c'}`,
                  borderRadius: 4,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 500,
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
                  padding: '7px 14px',
                  fontSize: 13,
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
                      width: 12,
                      height: 12,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Editando...
                  </>
                ) : (
                  'Editar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
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

export default EditarMicroservicio;