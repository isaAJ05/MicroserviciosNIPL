import React, { useState, useEffect, useRef } from "react";
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

function createEditorTheme(lightTheme) {
  return EditorView.theme({
    '&': { height: '100%', border: 'none', background: lightTheme ? '#fff' : '#0d1117', fontSize: '14px' },
    '.cm-content': {
      padding: '16px 20px',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
      fontSize: '14px',
      lineHeight: '1.45',
      color: lightTheme ? '#1f2328' : '#e6edf3',
      minHeight: '100%'
    },
    '.cm-editor': { height: '100%' },
    '.cm-focused': { outline: 'none' },
    '.cm-gutters': {
      backgroundColor: lightTheme ? '#f6f8fa' : '#0d1117',
      color: lightTheme ? '#656d76' : '#7d8590',
      border: 'none',
      paddingRight: '16px'
    },
    '.cm-activeLineGutter': { backgroundColor: lightTheme ? '#fff' : '#161b22' },
    '.cm-activeLine': { backgroundColor: lightTheme ? '#f6f8fa' : '#161b2240' },
    '.cm-selectionMatch': { backgroundColor: lightTheme ? '#ffd33d33' : '#ffd33d44' },
    '.cm-searchMatch': { backgroundColor: lightTheme ? '#ffdf5d33' : '#ffdf5d44' },
    '.cm-cursor': { borderLeftColor: lightTheme ? '#1f2328' : '#e6edf3' },
    '.cm-scroller': { overflow: 'auto' }
  });
}

function PythonEditor({ code, setCode, lightTheme }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const extensions = [
        basicSetup,
        python(),
        createEditorTheme(lightTheme),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setCode(update.state.doc.toString());
          }
        })
      ];
      if (!lightTheme) extensions.splice(2, 0, oneDark);
      const state = EditorState.create({ doc: code, extensions });
      viewRef.current = new EditorView({ state, parent: editorRef.current });
    } else if (viewRef.current) {
      const currentCode = viewRef.current.state.doc.toString();
      if (currentCode !== code) {
        viewRef.current.dispatch({ changes: { from: 0, to: currentCode.length, insert: code } });
      }
    }
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [code, lightTheme]);

  return (
    <div
      ref={editorRef}
      style={{
        height: '100%',
        width: '100%',
        background: lightTheme ? '#fff' : '#0d1117',
        overflow: 'hidden'
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

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/microservices`)
      .then(res => res.json())
      .then(data => {
        const ms = (data.microservices || []).find(m => m.id === id);
        if (ms) {
          setMicroservice(ms);
          setForm({
            name: ms.name,
            processing_type: ms.processing_type,
            endpoint: ms.endpoint,
            code: ms.code
          });
        }
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCodeChange = code => {
    setForm({ ...form, code });
  };

  const handleSubmit = async e => {
    e.preventDefault();
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

  const handleTestCode = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch('http://127.0.0.1:5000/test-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.code })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Salida:\n" + (data.output || "") + (data.error ? "\nError:\n" + data.error : ""));
      } else {
        setError(data.error || "Error al probar el código");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  if (!microservice) return (
  <div style={{
    height: '100vh',
    background: lightTheme ? '#f8f9fa' : '#23263a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: lightTheme ? '#23263a' : '#fff',
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
      background: lightTheme ? '#f8f9fa' : '#23263a'
    }}>
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
          MicroServicios
        </button>
        <h1>Editar Microservicio</h1>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel izquierdo - Configuración */}
        <div style={{
          width: '380px',
          background: lightTheme ? '#fff' : '#181c27',
          borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
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
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#4285f4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600
            }}>
              1
            </div>
            <span style={{
              fontWeight: 600,
              fontSize: 15,
              color: lightTheme ? '#1f2328' : '#fff'
            }}>
              Configuración
            </span>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
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
                    width: '100%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#0d1117',
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
                    width: '100%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#0d1117',
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
                        value={form.port || ""}
                        onChange={handleChange}
                        placeholder="Ej: 32779"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                          borderRadius: 4,
                          background: lightTheme ? '#fff' : '#0d1117',
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
                    width: '100%',
                    padding: '7px 10px',
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                    borderRadius: 4,
                    background: lightTheme ? '#fff' : '#0d1117',
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
            background: lightTheme ? '#fff' : '#181c27',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#4285f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600
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
            <button
              onClick={handleTestCode}
              style={{
                background: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              PROBAR FUNCIÓN
            </button>
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
            background: lightTheme ? '#f6f8fa' : '#0d1117',
            borderTop: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0
          }}>
            <div></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  color: lightTheme ? '#656d76' : '#8b949e',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 4,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  background: isLoading ? '#6c757d' : '#1a73e8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
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
                    EDITANDO...
                  </>
                ) : (
                  'EDITAR'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer" style={{ margin: 0 }}>
        <div>
          MicroServicios NIPL &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
        </div>
        <div>
          <span>Contacto: microservicios@uninorte.edu.co</span>
        </div>
      </footer>
    </div>
  );
}

export default EditarMicroservicio;