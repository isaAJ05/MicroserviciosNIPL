import React, { useState, useRef, useEffect } from 'react';
// Importar CodeMirror para el editor de código
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import './styles/AgregarMicroservicio.css';
import './styles/App.css';
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
  },
  '.cm-scroller': {
    overflow: 'auto'
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
      className="python-editor"
    />
  );
}

function AgregarMicroservicio({ onBack, lightTheme }) {
  const [microservice, setMicroservice] = useState({
    name: "",
    processing_type: "",
    description: "",
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
            "data": data,
            "timestamp": "2025-09-24T10:00:00Z"
        }
        
        return result
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Error en el microservicio: {str(e)}"
        }

# Ejemplo de uso
if __name__ == "__main__":
    # Prueba local del microservicio
    test_data = {"ejemplo": "datos de prueba"}
    resultado = main(test_data)
    print(resultado)`
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

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
      const token = localStorage.getItem('accessToken');
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
          code: microservice.code
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("¡Microservicio creado exitosamente!");
        setTimeout(() => {
          onBack();
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
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/test-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: microservice.code })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: 'No se pudo conectar con el servidor' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`}>
      <nav className="navbar">
        <button
          className="toggle-history-btn"
          onClick={onBack}
          title="Volver al panel principal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          MicroDock
        </button>
        <h1>Crear Microservicio</h1>
      </nav>

      <div className="agregar-ms-main">
        {/* Panel izquierdo - Configuración */}
        <div className="agregar-ms-config">
          <div className="agregar-ms-config-header">
            <div className="agregar-ms-step">1</div>
            <span className="agregar-ms-title">Configuración</span>
            <div className="agregar-ms-check">
              <svg width="10" height="10" fill="#fff" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          </div>
          <div className="agregar-ms-form">
            <form onSubmit={handleSubmit}>
              <div className="agregar-ms-field">
                <label className="agregar-ms-label">
                  Nombre del microservicio *
                </label>
                <input
                  type="text"
                  value={microservice.name}
                  onChange={e => setMicroservice({ ...microservice, name: e.target.value })}
                  placeholder="mi_microservicio"
                  className="agregar-ms-input"
                  required
                />
                <div className="agregar-ms-help">
                  Nombre identificador del microservicio
                </div>
              </div>
              <div className="agregar-ms-field">
                <label className="agregar-ms-label">
                  Tipo de Procesamiento *
                </label>
                <select
                  value={microservice.processing_type}
                  onChange={e => setMicroservice({ ...microservice, processing_type: e.target.value })}
                  className="agregar-ms-select"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Data Processing">Procesamiento de Datos</option>
                  <option value="Image Processing">Procesamiento de Imágenes</option>
                  <option value="Text Processing">Procesamiento de Texto</option>
                  <option value="API Service">Servicio API REST</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="File Processing">Procesamiento de Archivos</option>
                  <option value="Web Scraping">Web Scraping</option>
                  <option value="Database Operations">Operaciones de Base de Datos</option>
                  <option value="Batch Processing">Procesamiento por Lotes</option>
                  <option value="Real-time Processing">Procesamiento en Tiempo Real</option>
                  <option value="Authentication Service">Servicio de Autenticación</option>
                  <option value="Notification Service">Servicio de Notificaciones</option>
                  <option value="Other">Otro</option>
                </select>
                <div className="agregar-ms-help">
                  Selecciona el tipo que mejor describe tu microservicio
                </div>
              </div>
              <div className="agregar-ms-field">
                <label className="agregar-ms-label">
                  Descripción
                </label>
                <textarea
                  value={microservice.description}
                  onChange={e => setMicroservice({ ...microservice, description: e.target.value })}
                  placeholder="Describe qué hace tu microservicio..."
                  className="agregar-ms-textarea"
                />
                <div className="agregar-ms-help">
                  Documentación breve del propósito del microservicio
                </div>
              </div>
              <div className="agregar-ms-field">
                <div className="agregar-ms-auth-box">
                  <div className="agregar-ms-auth-row">
                    <input
                      type="checkbox"
                      id="roble-auth"
                      checked={microservice.use_roble_auth}
                      onChange={e => setMicroservice({ ...microservice, use_roble_auth: e.target.checked })}
                      className="agregar-ms-checkbox"
                    />
                    <label 
                      htmlFor="roble-auth"
                      className="agregar-ms-label"
                    >
                      Autenticarse con Roble
                    </label>
                  </div>
                  <div className="agregar-ms-auth-help">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                    </svg>
                    {microservice.use_roble_auth ? 
                      "✅ Este microservicio podrá acceder a los servicios de Roble" :
                      "El microservicio funcionará de forma independiente sin autenticación"
                    }
                  </div>
                </div>
              </div>
              {error && (
                <div className="agregar-ms-error">
                  {error}
                </div>
              )}
              {success && (
                <div className="agregar-ms-success">
                  {success}
                </div>
              )}
            </form>
          </div>
        </div>
        {/* Panel derecho - Editor de código */}
        <div className="agregar-ms-code-panel">
          <div className="agregar-ms-code-header">
            <div className="agregar-ms-step">2</div>
            <span className="agregar-ms-title">Código</span>
            <button 
              onClick={handleTestCode}
              className="agregar-ms-test-btn"
            >
              PROBAR FUNCIÓN
            </button>
          </div>
          <div className="agregar-ms-editor-container">
            <PythonEditor 
              code={microservice.code} 
              setCode={(code) => setMicroservice({ ...microservice, code })} 
              lightTheme={lightTheme}
            />
            {testResult && (
              <div className="agregar-ms-test-result">
                <strong>Resultado de la prueba:</strong>
                <pre>
                  {testResult.output}
                  {testResult.error && (
                    <span className="agregar-ms-test-error">{'\n' + testResult.error}</span>
                  )}
                </pre>
              </div>
            )}
            {isTesting && (
              <div className="agregar-ms-testing">
                Ejecutando código...
              </div>
            )}
          </div>
          <div className="agregar-ms-footer">
            <div></div>
            <div className="agregar-ms-footer-btns">
              <button
                onClick={onBack}
                className="agregar-ms-cancel-btn"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`agregar-ms-create-btn${isLoading ? " loading" : ""}`}
              >
                {isLoading ? (
                  <>
                    <div className="agregar-ms-spinner" />
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
      <footer className="footer">
        <div>
          MicroDock NIPL &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
        </div>
        <div>
          <span>Contacto: microservicios@uninorte.edu.co</span>
        </div>
      </footer>
    </div>
  );
}

export default AgregarMicroservicio;