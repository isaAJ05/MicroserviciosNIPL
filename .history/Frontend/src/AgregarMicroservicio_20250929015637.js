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
  },
  '.cm-scroller': {
    overflow: 'auto' // Asegura scroll interno
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
      style={{ 
        height: '100%',
        width: '100%',
        background: lightTheme ? '#fff' : '#0d1117',
        overflow: 'hidden' // Evita scroll duplicado
      }}
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
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', 
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
        <h1>Crear Microservicio</h1>
      </nav>

      <div style={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden' // Evita scroll en el contenedor principal
      }}>
        {/* Panel izquierdo - Configuración */}
        <div style={{ 
          width: '340px', 
          background: lightTheme ? '#fff' : '#181c27',
          borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
          padding: '24px 20px',
          overflowY: 'auto',
          flexShrink: 0 // No se encoge
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
            {/* Nombre del microservicio */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                fontSize: 14,
                color: lightTheme ? '#656d76' : '#8b949e'
              }}>
                Nombre del microservicio *
              </label>
              <input
                type="text"
                value={microservice.name}
                onChange={e => setMicroservice({ ...microservice, name: e.target.value })}
                placeholder="mi_microservicio"
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
                Nombre identificador del microservicio
              </div>
            </div>

            {/* Tipo de procesamiento */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                fontSize: 14,
                color: lightTheme ? '#656d76' : '#8b949e'
              }}>
                Tipo de Procesamiento *
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
              <div style={{ 
                marginTop: 6,
                color: lightTheme ? '#656d76' : '#8b949e',
                fontSize: 12
              }}>
                Selecciona el tipo que mejor describe tu microservicio
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontWeight: 500, 
                fontSize: 14,
                color: lightTheme ? '#656d76' : '#8b949e'
              }}>
                Descripción
              </label>
              <textarea
                value={microservice.description}
                onChange={e => setMicroservice({ ...microservice, description: e.target.value })}
                placeholder="Describe qué hace tu microservicio..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 6,
                  background: lightTheme ? '#fff' : '#0d1117',
                  color: lightTheme ? '#1f2328' : '#e6edf3',
                  fontSize: 14,
                  resize: 'vertical',
                  minHeight: '80px',
                  maxHeight: '120px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              />
              <div style={{ 
                marginTop: 6,
                color: lightTheme ? '#656d76' : '#8b949e',
                fontSize: 12
              }}>
                Documentación breve del propósito del microservicio
              </div>
            </div>

            {/* Autenticación con Roble */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                padding: '16px',
                border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                borderRadius: 6,
                background: lightTheme ? '#f6f8fa' : '#161b22'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  marginBottom: 12
                }}>
                  <input
                    type="checkbox"
                    id="roble-auth"
                    checked={microservice.use_roble_auth}
                    onChange={e => setMicroservice({ ...microservice, use_roble_auth: e.target.checked })}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: 'pointer'
                    }}
                  />
                  <label 
                    htmlFor="roble-auth"
                    style={{ 
                      fontWeight: 500, 
                      fontSize: 14,
                      color: lightTheme ? '#1f2328' : '#e6edf3',
                      cursor: 'pointer'
                    }}
                  >
                    Autenticarse con Roble
                  </label>
                </div>
                <div style={{ 
                  fontSize: 12,
                  color: lightTheme ? '#656d76' : '#8b949e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                  </svg>
                  {microservice.use_roble_auth ? 
                    "✅ Este microservicio podrá acceder a los servicios de Roble" :
                    "El microservicio funcionará de forma independiente sin autenticación"
                  }
                </div>
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
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden' // Evita scroll externo
        }}>
          {/* Header del código */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: lightTheme ? '#fff' : '#181c27',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0 // No se encoge
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

          {/* Editor - Con altura calculada dinámicamente */}
          <div style={{ 
            flex: 1,
            position: 'relative',
            overflow: 'hidden' // El scroll lo manejará CodeMirror internamente
          }}>
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
            borderTop: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0 // No se encoge
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

      {/* Footer - Ahora fijo al final */}
      <footer className="footer">
        <div>
          Microservicios NIPL &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
        </div>
        <div>
          <span>Contacto: microservicios@uninorte.edu.co</span>
        </div>
      </footer>
    </div>
  );
}

export default AgregarMicroservicio;