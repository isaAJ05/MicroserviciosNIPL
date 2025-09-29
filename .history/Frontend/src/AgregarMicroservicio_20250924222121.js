import React, { useState, useRef, useEffect } from 'react';
import './App.css';
// Importar CodeMirror para el editor de código
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

// Tema personalizado para el editor
const myTheme = EditorView.theme({
  '&': {
    height: '400px',
    border: '2px solid #9b0018',
    borderRadius: '8px',
    background: '#181c27'
  },
  '.cm-content': {
    padding: '16px',
    fontFamily: '"Fira Code", "Consolas", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#fff'
  },
  '.cm-editor': {
    height: '100%'
  },
  '.cm-focused': {
    outline: 'none'
  },
  '.cm-gutters': {
    backgroundColor: '#181c27',
    color: '#9b0018',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#23263a'
  },
  '.cm-activeLine': {
    backgroundColor: '#23263a40'
  }
});

function PythonEditor({ code, setCode }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          python(),
          oneDark,
          myTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setCode(update.state.doc.toString());
            }
          })
        ]
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

  return <div ref={editorRef} className="python-editor-container" />;
}

function AgregarMicroservicio({ onBack, lightTheme }) {
  const [microservice, setMicroservice] = useState({
    name: "",
    processing_type: "",
    code: "# Escribe tu código Python aquí\ndef main():\n    print('Hola Mundo')\n\nif __name__ == '__main__':\n    main()"
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
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{ minHeight: '100vh', background: lightTheme ? '#f5f5f5' : '#23263a' }}>
      <nav className="navbar">
        <button
          className="toggle-history-btn"
          onClick={onBack}
          title="Volver al panel principal"
        >
          ← Volver
        </button>
        <h1>Agregar Microservicio</h1>
      </nav>

      <div className="panel-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Información básica */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 600, 
                color: lightTheme ? '#23263a' : '#fff' 
              }}>
                Nombre del Microservicio
              </label>
              <input
                type="text"
                value={microservice.name}
                onChange={e => setMicroservice({ ...microservice, name: e.target.value })}
                placeholder="Ej: Procesador de Imágenes"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #9b0018',
                  borderRadius: 8,
                  background: lightTheme ? '#fff' : '#181c27',
                  color: lightTheme ? '#23263a' : '#fff',
                  fontSize: 16
                }}
                required
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 600, 
                color: lightTheme ? '#23263a' : '#fff' 
              }}>
                Tipo de Procesamiento
              </label>
              <select
                value={microservice.processing_type}
                onChange={e => setMicroservice({ ...microservice, processing_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #9b0018',
                  borderRadius: 8,
                  background: lightTheme ? '#fff' : '#181c27',
                  color: lightTheme ? '#23263a' : '#fff',
                  fontSize: 16
                }}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Data Processing">Procesamiento de Datos</option>
                <option value="Image Processing">Procesamiento de Imágenes</option>
                <option value="Text Processing">Procesamiento de Texto</option>
                <option value="API Service">Servicio API</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="File Processing">Procesamiento de Archivos</option>
                <option value="Other">Otro</option>
              </select>
            </div>
          </div>

          {/* Editor de código */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: 12, 
              fontWeight: 600, 
              color: lightTheme ? '#23263a' : '#fff',
              fontSize: 18
            }}>
              Código Python
            </label>
            
            <div className="query-input" style={{ marginBottom: 20 }}>
              <PythonEditor 
                code={microservice.code} 
                setCode={(code) => setMicroservice({ ...microservice, code })} 
              />
              <div className="buttons-row" style={{ marginTop: 15 }}>
                <button 
                  type="button"
                  onClick={handleTestCode}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600
                  }}
                  title="Probar código"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v18l15-9-15-9z" />
                  </svg>
                  Probar
                </button>
                
                <button 
                  type="button"
                  onClick={() => setMicroservice({ ...microservice, code: "" })}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600
                  }}
                  title="Limpiar código"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div style={{
              color: '#ff1744',
              background: lightTheme ? '#ffebee' : '#4f1f1f',
              border: '1px solid #ff1744',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              color: '#00e676',
              background: lightTheme ? '#e8f5e8' : '#1f4f2f',
              border: '1px solid #00e676',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
              fontWeight: 600
            }}>
              {success}
            </div>
          )}

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 15, justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: lightTheme ? '#6c757d' : '#495057',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#666' : '#9b0018',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Guardando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Microservicio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgregarMicroservicio;
