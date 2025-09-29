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
    height: '450px', // Altura fija para ~30 líneas
    border: `1px solid ${lightTheme ? '#d1d9e0' : '#9b0018'}`,
    borderRadius: '8px',
    background: lightTheme ? '#fff' : '#0f131c',
    fontSize: '14px'
  },
  '.cm-content': {
    padding: '16px 20px',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", "Menlo", monospace',
    fontSize: '15px',
    lineHeight: '1.5',
    color: lightTheme ? '#1f2328' : '#ffffff',
    minHeight: '100%'
  },
  '.cm-editor': {
    height: '100%'
  },
  '.cm-focused': {
    outline: 'none'
  },
  '.cm-gutters': {
    backgroundColor: lightTheme ? '#f6f8fa' : '#0f131c',
    color: lightTheme ? '#656d76' : '#9b0018',
    border: 'none',
    paddingRight: '16px',
    borderRight: `1px solid ${lightTheme ? '#e1e4e8' : '#9b0018'}`
  },
  '.cm-activeLineGutter': {
    backgroundColor: lightTheme ? '#fff' : '#161b22',
    color: lightTheme ? '#1f2328' : '#ffffff',
    fontWeight: 'bold'
  },
  '.cm-activeLine': {
    backgroundColor: lightTheme ? '#f6f8fa' : '#161b2240'
  },
  '.cm-cursor': {
    borderLeftColor: lightTheme ? '#1f2328' : '#ffffff',
    borderLeftWidth: '2px'
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
        height: '450px',
        background: lightTheme ? '#fff' : '#0f131c',
        borderRadius: '8px'
      }}
    />
  );
}

function AgregarMicroservicio({ onBack, lightTheme }) {
  const [microservice, setMicroservice] = useState({
    name: "",
    processing_type: "",
    description: "",
    code: `def process_data(data):
    """
    Función principal del microservicio
    
    Args:
        data: Datos de entrada
        
    Returns:
        dict: Resultado del procesamiento
    """
    try:
        # Tu código aquí
        result = {
            "status": "success",
            "message": "Procesamiento exitoso",
            "data": data
        }
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error: {str(e)}"
        }

# Ejemplo de uso
if __name__ == "__main__":
    test_data = {"test": "ejemplo"}
    print(process_data(test_data))`
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeErrors, setCodeErrors] = useState([]);

  // Validar sintaxis de Python
  const validatePythonCode = (code) => {
    const errors = [];
    
    // Verificaciones básicas de sintaxis Python
    const lines = code.split('\n');
    let indentLevel = 0;
    let inFunction = false;
    let inClass = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '') continue; // Saltar líneas vacías

      // Verificar indentación
      const currentIndent = line.length - line.trimLeft().length;
      
      // Verificar palabras clave de Python
      if (trimmed.startsWith('def ')) {
        inFunction = true;
        if (!trimmed.endsWith(':')) {
          errors.push(`Línea ${i + 1}: Falta ':' después de la definición de función`);
        }
      } else if (trimmed.startsWith('class ')) {
        inClass = true;
        if (!trimmed.endsWith(':')) {
          errors.push(`Línea ${i + 1}: Falta ':' después de la definición de clase`);
        }
      } else if (trimmed.startsWith('if ') || trimmed.startsWith('elif ') || 
                 trimmed.startsWith('else') || trimmed.startsWith('for ') ||
                 trimmed.startsWith('while ') || trimmed.startsWith('try') ||
                 trimmed.startsWith('except') || trimmed.startsWith('finally')) {
        if (!trimmed.endsWith(':')) {
          errors.push(`Línea ${i + 1}: Falta ':' después de la declaración`);
        }
      }

      // Verificar comillas balanceadas
      const singleQuotes = (trimmed.match(/'/g) || []).length;
      const doubleQuotes = (trimmed.match(/"/g) || []).length;
      
      if (singleQuotes % 2 !== 0) {
        errors.push(`Línea ${i + 1}: Comillas simples no balanceadas`);
      }
      if (doubleQuotes % 2 !== 0) {
        errors.push(`Línea ${i + 1}: Comillas dobles no balanceadas`);
      }

      // Verificar paréntesis balanceados
      const openParens = (trimmed.match(/\(/g) || []).length;
      const closeParens = (trimmed.match(/\)/g) || []).length;
      const openBrackets = (trimmed.match(/\[/g) || []).length;
      const closeBrackets = (trimmed.match(/\]/g) || []).length;
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;

      if (openParens !== closeParens) {
        errors.push(`Línea ${i + 1}: Paréntesis no balanceados`);
      }
      if (openBrackets !== closeBrackets) {
        errors.push(`Línea ${i + 1}: Corchetes no balanceados`);
      }
      if (openBraces !== closeBraces) {
        errors.push(`Línea ${i + 1}: Llaves no balanceadas`);
      }
    }

    // Verificar que haya al menos una función
    if (!code.includes('def ')) {
      errors.push('El código debe contener al menos una función');
    }

    return errors;
  };

  // Validar código cuando cambie
  useEffect(() => {
    if (microservice.code.trim()) {
      const errors = validatePythonCode(microservice.code);
      setCodeErrors(errors);
    }
  }, [microservice.code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!microservice.name.trim()) {
      setError("El nombre del microservicio es obligatorio");
      return;
    }
    
    if (!microservice.processing_type.trim()) {
      setError("El tipo de procesamiento es obligatorio");
      return;
    }
    
    if (!microservice.code.trim()) {
      setError("El código es obligatorio");
      return;
    }

    if (codeErrors.length > 0) {
      setError("El código tiene errores de sintaxis. Por favor corrígelos antes de crear el microservicio.");
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

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`} style={{ minHeight: '100vh' }}>
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
          Volver
        </button>
        <h1>Crear Microservicio</h1>
      </nav>

      <div className="panel-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Información básica */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                fontSize: '14px',
                color: lightTheme ? '#23263a' : '#fff'
              }}>
                Nombre del Microservicio *
              </label>
              <input
                type="text"
                value={microservice.name}
                onChange={e => setMicroservice({ ...microservice, name: e.target.value })}
                placeholder="mi_microservicio"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#9b0018'}`,
                  borderRadius: '6px',
                  background: lightTheme ? '#fff' : '#23263a',
                  color: lightTheme ? '#23263a' : '#fff',
                  fontSize: '14px',
                  fontFamily: 'ui-monospace, monospace'
                }}
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                fontSize: '14px',
                color: lightTheme ? '#23263a' : '#fff'
              }}>
                Tipo de Procesamiento *
              </label>
              <select
                value={microservice.processing_type}
                onChange={e => setMicroservice({ ...microservice, processing_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${lightTheme ? '#d1d9e0' : '#9b0018'}`,
                  borderRadius: '6px',
                  background: lightTheme ? '#fff' : '#23263a',
                  color: lightTheme ? '#23263a' : '#fff',
                  fontSize: '14px'
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
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px',
              color: lightTheme ? '#23263a' : '#fff'
            }}>
              Descripción
            </label>
            <textarea
              value={microservice.description}
              onChange={e => setMicroservice({ ...microservice, description: e.target.value })}
              placeholder="Describe qué hace tu microservicio..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${lightTheme ? '#d1d9e0' : '#9b0018'}`,
                borderRadius: '6px',
                background: lightTheme ? '#fff' : '#23263a',
                color: lightTheme ? '#23263a' : '#fff',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px',
                fontFamily: 'system-ui, sans-serif'
              }}
            />
          </div>

          {/* Editor de código */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px',
              color: lightTheme ? '#23263a' : '#fff'
            }}>
              Código Python * 
              <span style={{ fontWeight: 'normal', fontSize: '12px', color: lightTheme ? '#656d76' : '#8b949e' }}>
                (aproximadamente 30 líneas)
              </span>
            </label>
            
            <PythonEditor 
              code={microservice.code} 
              setCode={(code) => setMicroservice({ ...microservice, code })} 
              lightTheme={lightTheme}
            />

            {/* Errores de sintaxis */}
            {codeErrors.length > 0 && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: lightTheme ? '#ffebe9' : '#490202',
                border: `1px solid ${lightTheme ? '#ffb3ba' : '#f85149'}`,
                borderRadius: '6px'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '6px',
                  color: lightTheme ? '#d1242f' : '#f85149'
                }}>
                  Errores de sintaxis encontrados:
                </div>
                {codeErrors.map((error, index) => (
                  <div key={index} style={{ 
                    fontSize: '13px',
                    color: lightTheme ? '#d1242f' : '#f85149',
                    marginBottom: '2px'
                  }}>
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {/* Validación exitosa */}
            {microservice.code.trim() && codeErrors.length === 0 && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: lightTheme ? '#dafbe1' : '#0f5132',
                border: `1px solid ${lightTheme ? '#34d399' : '#238636'}`,
                borderRadius: '6px',
                color: lightTheme ? '#0f5132' : '#238636',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                ✅ Código Python válido
              </div>
            )}
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div style={{
              color: '#f85149',
              background: lightTheme ? '#ffebe9' : '#490202',
              border: `1px solid ${lightTheme ? '#ffb3ba' : '#f85149'}`,
              borderRadius: '6px',
              padding: '12px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              color: '#238636',
              background: lightTheme ? '#dafbe1' : '#0f5132',
              border: `1px solid ${lightTheme ? '#34d399' : '#238636'}`,
              borderRadius: '6px',
              padding: '12px',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          {/* Botón de crear */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                color: lightTheme ? '#656d76' : '#8b949e',
                border: `1px solid ${lightTheme ? '#d1d9e0' : '#30363d'}`,
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading || codeErrors.length > 0}
              style={{
                background: isLoading || codeErrors.length > 0 ? '#6c757d' : '#9b0018',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || codeErrors.length > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Creando...
                </>
              ) : (
                'Crear Microservicio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgregarMicroservicio;