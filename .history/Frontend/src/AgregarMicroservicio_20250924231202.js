import React, { useState, useRef, useEffect } from 'react';
import './App.css';
// Importar CodeMirror para el editor de código
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

// Tema personalizado para el editor
const createEditorTheme = (lightTheme) => EditorView.theme({
  '&': {
    height: '100%',
    border: 'none',
    background: lightTheme ? '#fff' : '#0d1117',
    fontSize: '14px'
  },
  '.cm-content': {
    padding: '16px 20px',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", "Menlo", monospace',
    fontSize: '14px',
    lineHeight: '1.45',
    color: lightTheme ? '#1f2328' : '#e6edf3',
    minHeight: '100%'
  },
  '.cm-editor': {
    height: '100%'
  },
  '.cm-focused': {
    outline: 'none'
  },
  '.cm-gutters': {
    backgroundColor: lightTheme ? '#f6f8fa' : '#0d1117',
    color: lightTheme ? '#656d76' : '#7d8590',
    border: 'none',
    paddingRight: '16px'
  },
  '.cm-activeLineGutter': {
    backgroundColor: lightTheme ? '#fff' : '#161b22'
  },
  '.cm-activeLine': {
    backgroundColor: lightTheme ? '#f6f8fa' : '#161b2240'
  },
  '.cm-selectionMatch': {
    backgroundColor: lightTheme ? '#ffd33d33' : '#ffd33d44'
  },
  '.cm-searchMatch': {
    backgroundColor: lightTheme ? '#ffdf5d33' : '#ffdf5d44'
  },
  '.cm-cursor': {
    borderLeftColor: lightTheme ? '#1f2328' : '#e6edf3'
  }
});

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

      // Solo agregar oneDark si no es tema claro
      if (!lightTheme) {
        extensions.splice(2, 0, oneDark);
      }

      const state = EditorState.create({
        doc: code,
        extensions
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={editorRef} 
      style={{ 
        height: '100%',
        background: lightTheme ? '#fff' : '#0d1117'
      }}
    />
  );
}

function AgregarMicroservicio({ onBack, lightTheme }) {
  const [microservice, setMicroservice] = useState({
    name: "",
    processing_type: "",
    code: `import functions_framework

@functions_framework.http
def hello_http(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using make_response
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'name' in request_json:
        name = request_json['name']
    elif request_args and 'name' in request_args:
        name = request_args['name']
    else:
        name = 'World'
    return 'Hello {}!'.format(name)`
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!microservice.name.trim() || !microservice.processing_type.trim() || !microservice.code.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch('http://127.0.0.1:5000/microservices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(microservice)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess("Microservicio creado exitosamente");
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

  const handleTestCode = () => {
    // Función para probar el código (puedes implementar esto más tarde)
    alert("Función de prueba - Por implementar");
  };

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{ minHeight: '100vh', background: lightTheme ? '#f8f9fa' : '#23263a' }}>
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
        <h1>Crear función</h1>
      </nav>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Panel izquierdo - Configuración */}
        <div style={{ 
          width: '340px', 
          background: lightTheme ? '#fff' : '#181c27',
          borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
          padding: '24px 20px',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#4285f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600
              }}>
                1
              </div>
              <span style={{ 
                fontWeight: 600, 
                fontSize: 16,
                color: lightTheme ? '#1f2328' : '#fff'
              }}>
                Configuración
              </span>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto'
              }}>
                <svg width="12" height="12" fill="#fff" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                fontSize: 14,
                color: lightTheme ? '#656d76' : '#8b949e'
              }}>
                Nombre de la función *
              </label>
              <input
                type="text"
                value={microservice.name}
                onChange={e => setMicroservice({ ...microservice, name: e.target.value })}
                placeholder="hello_http"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 6,
                  background: lightTheme ? '#fff' : '#0d1117',
                  color: lightTheme ? '#1f2328' : '#e6edf3',
                  fontSize: 14,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                fontSize: 14,
                color: lightTheme ? '#656d76' : '#8b949e'
              }}>
                Runtime
              </label>
              <select
                value={microservice.processing_type}
                onChange={e => setMicroservice({ ...microservice, processing_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 6,
                  background: lightTheme ? '#fff' : '#0d1117',
                  color: lightTheme ? '#1f2328' : '#e6edf3',
                  fontSize: 14
                }}
                required
              >
                <option value="">Python 3.10</option>
                <option value="Data Processing">Python 3.9</option>
                <option value="Image Processing">Python 3.8</option>
                <option value="Text Processing">Node.js 18</option>
                <option value="API Service">Node.js 16</option>
                <option value="Machine Learning">Go 1.19</option>
                <option value="File Processing">Java 11</option>
              </select>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                marginTop: 6,
                color: lightTheme ? '#656d76' : '#8b949e',
                fontSize: 12
              }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                </svg>
                Información sobre la versión
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                fontSize: 14,
                color: lightTheme ? '#656d76' : '#8b949e'
              }}>
                Entry point *
              </label>
              <input
                type="text"
                defaultValue="hello_http"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 6,
                  background: lightTheme ? '#fff' : '#0d1117',
                  color: lightTheme ? '#1f2328' : '#e6edf3',
                  fontSize: 14,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                }}
                required
              />
              <div style={{ 
                marginTop: 6,
                color: lightTheme ? '#656d76' : '#8b949e',
                fontSize: 12
              }}>
                Presiona Alt+F1 para ver las opciones de accesibilidad. El nombre de la función ejecutable en tu código fuente.
              </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div style={{
                color: '#f85149',
                background: lightTheme ? '#ffebe9' : '#490202',
                border: `1px solid ${lightTheme ? '#ffb3ba' : '#f85149'}`,
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                color: '#238636',
                background: lightTheme ? '#dafbe1' : '#0f5132',
                border: `1px solid ${lightTheme ? '#34d399' : '#238636'}`,
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
                fontSize: 14
              }}>
                {success}
              </div>
            )}
          </form>
        </div>

        {/* Panel derecho - Editor de código */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header del código */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: lightTheme ? '#fff' : '#181c27',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#4285f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600
              }}>
                2
              </div>
              <span style={{ 
                fontWeight: 600, 
                fontSize: 16,
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
                padding: '8px 16px',
                fontSize: 14,
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

          {/* Estructura de archivos */}
          <div style={{
            background: lightTheme ? '#f6f8fa' : '#0d1117',
            padding: '12px 20px',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            fontSize: 13
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: lightTheme ? '#656d76' : '#8b949e' }}>Código fuente</span>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span style={{ color: lightTheme ? '#656d76' : '#8b949e' }}>Inline Editor</span>
              <button style={{
                background: 'none',
                border: 'none',
                color: lightTheme ? '#0969da' : '#58a6ff',
                fontSize: 13,
                cursor: 'pointer',
                marginLeft: 'auto'
              }}>
                +
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" fill="#f1c40f" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"/>
              </svg>
              <span style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                color: lightTheme ? '#1f2328' : '#e6edf3'
              }}>
                main.py
              </span>
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z"/>
              </svg>
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, position: 'relative' }}>
            <PythonEditor 
              code={microservice.code} 
              setCode={(code) => setMicroservice({ ...microservice, code })} 
              lightTheme={lightTheme}
            />
          </div>

          {/* Footer con botones */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: lightTheme ? '#f6f8fa' : '#0d1117',
            borderTop: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`
          }}>
            <div></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  color: lightTheme ? '#656d76' : '#8b949e',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontSize: 14,
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
                  padding: '8px 16px',
                  fontSize: 14,
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
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    CREANDO...
                  </>
                ) : (
                  'CREAR'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgregarMicroservicio;
