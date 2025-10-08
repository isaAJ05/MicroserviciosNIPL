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
  const updatingFromOutside = useRef(false);
  const lastDocRef = useRef('');

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const extensions = [
        basicSetup,
        python(),
        createEditorTheme(lightTheme),
        // Escucha cambios internos pero NO fuerces setCode en cada tecla
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !updatingFromOutside.current) {
            lastDocRef.current = update.state.doc.toString();
          }
        }),
        // Guardar al perder foco o con Ctrl/Cmd+S
        EditorView.domEventHandlers({
          blur: () => {
            if (viewRef.current) setCode(viewRef.current.state.doc.toString());
            return false;
          },
          keydown: (e) => {
            const isSave = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
            if (isSave && viewRef.current) {
              e.preventDefault();
              setCode(viewRef.current.state.doc.toString());
              return true;
            }
            return false;
          }
        })
      ];

      if (!lightTheme) extensions.splice(2, 0, oneDark);

      const state = EditorState.create({ doc: code, extensions });

      viewRef.current = new EditorView({ state, parent: editorRef.current });
      lastDocRef.current = code;
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [lightTheme, setCode]);

  // Aplicar cambios externos (ej. seleccionar ejemplo)
  useEffect(() => {
    if (!viewRef.current) return;
    const currentCode = viewRef.current.state.doc.toString();
    if (currentCode === code) return;

    // Si el editor tiene foco, no forzamos reemplazo para no interferir
    if (viewRef.current.hasFocus) return;

    updatingFromOutside.current = true;
    const selection = viewRef.current.state.selection.main;
    viewRef.current.dispatch({
      changes: { from: 0, to: currentCode.length, insert: code },
      selection: { anchor: Math.min(selection.anchor, code.length), head: Math.min(selection.head, code.length) }
    });
    lastDocRef.current = code;
    updatingFromOutside.current = false;
  }, [code]);

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
const ejemplosCodigo = {
  "hola_mundo": `# Microservicio Hola Mundo

def main(data=None):
    """
    Devuelve un saludo simple.
    """
    return {
        "status": "success",
        "message": "Hola mundo desde el microservicio!",
        "data": data
    }

if __name__ == "__main__":
    print(main())`,
  "suma": `# Microservicio Suma

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

if __name__ == "__main__":
    test_data = {"a": 5, "b": 7}
    print(main(test_data))`,
  "consulta_roble": `# Microservicio Consulta Tabla Roble (usa credenciales del backend)


import os
import sys

def main(data=None):
    """
    Consulta una tabla en Roble usando las credenciales del backend.
    Args:
        data: dict con 'tableName' y filtros opcionales
    Returns:
        dict con la respuesta de Roble
    """
    try:
        # Cargar credenciales del entorno
        token = os.getenv("token_contract_xyz")
        email = os.getenv("email")
        password = os.getenv("password")
        table_name = data.get("tableName", "inventario")

        # 1. Login para obtener access token
        login_res = requests.post(
            f"https://roble-api.openlab.uninorte.edu.co/auth/{token}/login",
            json={"email": email, "password": password}
        )
        login_data = login_res.json()
        access_token = login_data.get("accessToken")
        if not access_token:
            return {"status": "error", "message": "No se pudo obtener accessToken", "login_response": login_data}

        # 2. Consulta la tabla
        params = {"tableName": table_name}
        # Agrega filtros si existen
        for k, v in (data or {}).items():
            if k not in ["tableName"]:
                params[k] = v

        res = requests.get(
            f"https://roble-api.openlab.uninorte.edu.co/database/{token}/read",
            headers={"Authorization": f"Bearer {access_token}"},
            params=params
        )
        if res.status_code == 200:
            return {"status": "success", "roble_data": res.json()}
        else:
            return {"status": "error", "message": f"Roble error: {res.status_code}", "details": res.text}
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    # Solo necesitas el nombre de la tabla y filtros opcionales
    test_data = {"tableName": "inventario"}
    print(str(main(test_data)).encode('utf-8', errors='replace').decode('cp1252', errors='replace'))`
};

function AgregarMicroservicio({ onBack, lightTheme }) {
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

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{ 
      height: '100vh', // Cambiado de minHeight a height
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
        <h1>Crear Microservicio</h1>
      </nav>

      <div style={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Panel izquierdo - Configuración */}
        <div style={{ 
          width: '380px', // Aumentado de 340px a 380px
          background: lightTheme ? '#fff' : '#181c27',
          borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
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
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0
          }}>
            <div style={{
              width: 28, // Reducido
              height: 28, // Reducido
              borderRadius: '50%',
              background: '#4285f4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13, // Reducido
              fontWeight: 600
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
              background: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto'
            }}>
              <svg width="10" height="10" fill="#fff" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          </div>

          {/* Formulario - más compacto */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
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
                    width: '100%',
                    padding: '7px 10px', // Reducido
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                    borderRadius: 4, // Reducido
                    background: lightTheme ? '#fff' : '#0d1117',
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
              <div style={{ marginBottom: 16 }}> {/* Reducido */}
                <label style={{ 
                  display: 'block', 
                  marginBottom: 6, // Reducido
                  fontWeight: 500, 
                  fontSize: 13, // Reducido
                  color: lightTheme ? '#656d76' : '#8b949e'
                }}>
                  Tipo de Procesamiento *
                </label>
                <select
                  value={microservice.processing_type}
                  onChange={e => setMicroservice(prev => ({ ...prev, processing_type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '7px 10px', // Reducido
                    border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                    borderRadius: 4, // Reducido
                    background: lightTheme ? '#fff' : '#0d1117',
                    color: lightTheme ? '#1f2328' : '#e6edf3',
                    fontSize: 13 // Reducido
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
                  marginTop: 4, // Reducido
                  color: lightTheme ? '#656d76' : '#8b949e',
                  fontSize: 11 // Reducido
                }}>
                  Selecciona el tipo que mejor describe tu microservicio
                </div>
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
      border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
      borderRadius: 4,
      background: lightTheme ? '#fff' : '#0d1117',
      color: lightTheme ? '#1f2328' : '#e6edf3',
      fontSize: 13
    }}
  >
    <option value="">Selecciona un ejemplo</option>
    <option value="hola_mundo">Hola Mundo</option>
    <option value="suma">Suma</option>
    <option value="consulta_roble">Consulta a Roble</option>
  </select>
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
            justifyContent: 'space-between',
            padding: '14px 20px', // Reducido
            background: lightTheme ? '#fff' : '#181c27',
            borderBottom: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, // Reducido
                height: 28, // Reducido
                borderRadius: '50%',
                background: '#4285f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13, // Reducido
                fontWeight: 600
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
            
            <button 
              onClick={handleTestCode}
              style={{
                background: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '7px 14px', // Reducido
                fontSize: 13, // Reducido
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
            background: lightTheme ? '#f6f8fa' : '#0d1117',
            borderTop: `1px solid ${lightTheme ? '#e1e4e8' : '#30363d'}`,
            flexShrink: 0
          }}>
            <div></div>
            <div style={{ display: 'flex', gap: 10 }}> {/* Reducido */}
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  color: lightTheme ? '#656d76' : '#8b949e',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                  borderRadius: 4,
                  padding: '7px 14px', // Reducido
                  fontSize: 13, // Reducido
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
                  padding: '7px 14px', // Reducido
                  fontSize: 13, // Reducido
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
                      width: 12, // Reducido
                      height: 12, // Reducido
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

      {/* Footer - sin margenes adicionales */}
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

export default AgregarMicroservicio;