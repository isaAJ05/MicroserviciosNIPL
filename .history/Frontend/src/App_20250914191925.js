import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import { syntaxHighlighting } from "@codemirror/language";
import { defaultHighlightStyle } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { lineNumbers, highlightActiveLine } from "@codemirror/view";

import { createTheme } from '@uiw/codemirror-themes';

import { tags as t } from '@lezer/highlight';
import TooltipPortal from "./TooltipPortal";

const myTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#181c27',
    backgroundImage: '',
    foreground: '#75baff',
    caret: '#ffffff',
    selection: '#036dd626',
    selectionMatch: '#036dd626',
    lineHighlight: '#181c27', 
    gutterBorder: 'transparent', // Elimina la línea blanca en el gutter
    gutterBackground: '#181c27', // Cambia el fondo de la columna de enumerado
    gutterForeground: '#9b0018', // Cambia el color de los números de línea
  },
  styles: [
    { tag: t.comment, color: '#787b8099' },
    { tag: t.variableName, color: '#0080ff' },
    { tag: [t.string, t.special(t.brace)], color: '#e17e00' },
    { tag: t.number, color: '#5c6166' },
    { tag: t.bool, color: '#5c6166' },
    { tag: t.null, color: '#5c6166' },
    { tag: t.keyword, color: '#e74c3c' },
    { tag: t.operator, color: '#00aed5' },
    { tag: t.className, color: '#5c6166' },
    { tag: t.definition(t.typeName), color: '#5c6166' },
    { tag: t.typeName, color: '#5c6166' },
    { tag: t.angleBracket, color: '#ffffff' },
    { tag: t.tagName, color: '#5c6166' },
    { tag: t.attributeName, color: '#5c6166' },
  ],
});


function SqlEditor({ query, setQuery }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: query,
        extensions: [
          sql(),
          keymap.of(defaultKeymap),
          myTheme,
          syntaxHighlighting(defaultHighlightStyle),
          lineNumbers(), // Mostrar líneas enumeradas
          highlightActiveLine(), // Resalta la línea activa
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setQuery(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => view.destroy();
  }, []);

  return <div ref={editorRef} className="sql-editor-container" />;
}

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  // Nuevo estado para bases de datos y tablas
  const [databases, setDatabases] = useState([]);
  const [expandedDb, setExpandedDb] = useState(null);          // Base de datos expandida
  const [tablesByDb, setTablesByDb] = useState({});             // Tablas por base de datos
  const [loadingTables, setLoadingTables] = useState({});       // Estado de carga por base
  const [isDbListOpen, setIsDbListOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDb, setSelectedDb] = useState("");
  const [newDb, setNewDb] = useState("");
  const [tableName, setTableName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  // Estado para animación de carga en el botón de subir archivo CSV
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  // Nuevo estado para animación de login
  const [loginFade, setLoginFade] = useState(false);
  const [mainFadeIn, setMainFadeIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerUser, setRegisterUser] = useState("");
  const [registerPass, setRegisterPass] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  // Nuevo estado para animación de cambio
  const [registerAnim, setRegisterAnim] = useState("");
  const [uploadBtnLoading, setUploadBtnLoading] = useState(false); // Estado para el botón de carga
  // Estado para animación de aparición del modal de subir CSV
  const [uploadAnim, setUploadAnim] = useState("");
  // Mensajes temporales en el output con desvanecido
  const [fadeError, setFadeError] = useState(false);
  const [fadeSuccess, setFadeSuccess] = useState(false);
  const [lightTheme, setLightTheme] = useState(() => {
    // Persistencia opcional: lee del localStorage si existe
    const saved = localStorage.getItem("lightTheme");
    return saved === "true";
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  // Estado para animación de fade del panel de usuario
  const [userPanelFade, setUserPanelFade] = useState(false);
  // Para cargar columnas de una tabla
  const [selectedTableColumns, setSelectedTableColumns] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [mainContentAnim, setMainContentAnim] = useState("");
  const [user, setUser] = useState(null);
  // Estado global para tooltip de columna
  const [colTooltip, setColTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });

  const prevHistoryOpen = useRef(isHistoryOpen);

  useEffect(() => {
    if (isHistoryOpen !== prevHistoryOpen.current) {
      if (isHistoryOpen) {
        setMainContentAnim("slide-in");
      } else {
        setMainContentAnim("slide-out");
      }
      prevHistoryOpen.current = isHistoryOpen;
    }
  }, [isHistoryOpen]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Luego en el inicio de la app, cargas el usuario:
  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  

    function GoogleLoginButton({ onLogin }) {
      const divRef = useRef(null);

      useEffect(() => {
        if (window.google && divRef.current) {
          window.google.accounts.id.initialize({
            client_id: 'com',
            callback: handleCredentialResponse,
          });

          window.google.accounts.id.renderButton(divRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
          });
        }
      }, []);

      const handleCredentialResponse = (response) => {
        // Enviar el token al backend
        fetch('http://localhost:5000/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              onLogin(data.user);
            } else {
              alert("Error de login con Google");
            }
          });
      };

      return <div ref={divRef}></div>;
    }


// Función para cargar columnas de una tabla
const handleShowColumns = (db, table) => {
  fetch(`http://127.0.0.1:5000/columns?db=${db}&table=${table}`)
    .then(res => res.json())
    .then(data => {
      setSelectedTableColumns(data.columns || []);
      setSelectedTable(table);
      setSelectedDb(db);
    })
    .catch(() => {
      setSelectedTableColumns([]);
      setSelectedTable(table);
      setSelectedDb(db);
    });
};

  // Efecto para aplicar el tema claro/oscuro
  useEffect(() => {
    const root = document.body;
    if (lightTheme) {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    // Persistencia opcional
    localStorage.setItem("lightTheme", lightTheme);
  }, [lightTheme]);

  // Obtener bases de datos al montar
  useEffect(() => {
    fetch('http://127.0.0.1:5000/databases')
      .then(res => res.json())
      .then(data => setDatabases(data.databases || []))
      .catch(() => setDatabases([]));
  }, []);

  useEffect(() => {
  if (!expandedDb || tablesByDb[expandedDb]) return;

  setLoadingTables(prev => ({ ...prev, [expandedDb]: true }));

  fetch(`http://127.0.0.1:5000/tables?db=${expandedDb}`)
    .then(res => res.json())
    .then(data => {
      setTablesByDb(prev => ({ ...prev, [expandedDb]: data.tables || [] }));
      setLoadingTables(prev => ({ ...prev, [expandedDb]: false }));
    })
    .catch(() => {
      setTablesByDb(prev => ({ ...prev, [expandedDb]: [] }));
      setLoadingTables(prev => ({ ...prev, [expandedDb]: false }));
    });
}, [expandedDb, tablesByDb]);


    // Obtener tablas de una base de datos al expandirla
  const handleExpandDb = (db) => {
  setExpandedDb(prev => (prev === db ? null : db));
};


  const handleUploadCsv = async () => {
  const dbToUse = newDb || selectedDb;
  if (!dbToUse || !tableName || !csvFile) {
    setError("Debes seleccionar o crear una base, poner nombre de tabla y elegir archivo.");
    return;
  }
  const formData = new FormData();
  formData.append("db", dbToUse);
  formData.append("table", tableName);
  formData.append("file", csvFile);

  const res = await fetch("http://127.0.0.1:5000/upload_csv", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) setError(data.error || "Error al subir CSV");
  else setResult(data);
  setShowUpload(false);
  // Refresca la lista de bases y tablas tras subir CSV
  refreshDatabases(dbToUse);
};

// Función para refrescar la lista de bases de datos y tablas
const refreshDatabases = async (dbToRefresh = null) => {
  // Actualiza bases de datos
  fetch('http://127.0.0.1:5000/databases')
    .then(res => res.json())
    .then(data => setDatabases(data.databases || []))
    .catch(() => setDatabases([]));
  // Si se pasa una base, refresca sus tablas
  if (dbToRefresh) {
    fetch(`http://127.0.0.1:5000/tables?db=${dbToRefresh}`)
      .then(res => res.json())
      .then(data => setTablesByDb(prev => ({ ...prev, [dbToRefresh]: data.tables || [] })))
      .catch(() => setTablesByDb(prev => ({ ...prev, [dbToRefresh]: [] })));
  }
};

  const handleExtract = async () => {
    setError('');
    setResult(null);
    // Divide por ; y filtra vacíos
    const queries = query
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    let lastResult = null;
    let dbCreated = false;
    let tableCreated = false;
    let dbNameCreated = null;
    let tableDbName = null;
    for (let q of queries) {
      try {
        const response = await fetch('http://127.0.0.1:5000/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: q })
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Error desconocido');
          break; // Detén si hay error
        } else {
          lastResult = data;
          // Detecta si la consulta es CREATE DATABASE o CREATE TABLE
          const qUpper = q.toUpperCase();
          if (qUpper.startsWith('CREATE DATABASE')) {
            dbCreated = true;
            // Extrae el nombre de la base
            const match = q.match(/CREATE DATABASE\s+(\w+)/i);
            if (match) dbNameCreated = match[1];
          } else if (qUpper.startsWith('CREATE TABLE')) {
            tableCreated = true;
            // Extrae el nombre de la base si es CREATE TABLE db.table
            const match = q.match(/CREATE TABLE\s+(\w+)\.(\w+)/i);
            if (match) tableDbName = match[1];
          }
        }
      } catch (err) {
        setError('No se pudo conectar con el backend');
        break;
      }
    }
    setResult(lastResult);
    // Si se creó una base o tabla, refresca la lista
    if (dbCreated && dbNameCreated) {
      refreshDatabases(dbNameCreated);
    } else if (tableCreated && (selectedDb || tableDbName)) {
      refreshDatabases(tableDbName || selectedDb);
    }
  };

  const startDragging = () => setIsDragging(true);
  const stopDragging = () => setIsDragging(false);

  const handleDragging = (e) => {
    if (!isDragging) return;
    const container = document.querySelector(".main-content");
    const containerWidth = container.offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth > 10 && newLeftWidth < 90) {
      setLeftWidth(newLeftWidth);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleDragging);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  // Mensajes temporales en el output
useEffect(() => {
  if (error) {
    setFadeError(false);
    const fadeTimer = setTimeout(() => setFadeError(true), 7500);
    const clearTimer = setTimeout(() => setError(''), 8000);
    return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
  }
}, [error]);

useEffect(() => {
  if (result && result.message) {
    setFadeSuccess(false);
    const fadeTimer = setTimeout(() => setFadeSuccess(true), 7500);
    const clearTimer = setTimeout(() => setResult(null), 8000);
    return () => { clearTimeout(fadeTimer); clearTimeout(clearTimer); };
  }
}, [result]);

  // Login visual simple
  return (
    <>
      {/* Fondo oscuro fijo para toda la app y transición */}
      <div style={{
        position: 'fixed',
        inset: 0,
        minHeight: '100vh',
        minWidth: '100vw',
        background: 'radial-gradient(ellipse, #3e4863 10%, #181c27 100%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div className={`login-bg${loginFade ? ' fade-out' : ''}`} style={{ minHeight: '100vh', position: 'fixed', inset: 0, zIndex: 10, display: isLoggedIn ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
        <form
          className={`login-form${!showRegister ? ' login-fade-in' : ''}`}
          style={{
            background: '#181c27',
            border: '2px solid #9b0018',
            borderRadius: 10,
            boxShadow: '0 0 24px #000a',
            padding: 36,
            minWidth: 320,
            display: showRegister ? 'none' : 'flex',
            flexDirection: 'column',
            gap: 18,
            color: '#fff',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20
          }}
          onSubmit={async e => {
            e.preventDefault();
            const user = loginUser.trim().toLowerCase();
            const pass = loginPass.trim();
            setLoginError("");
            // Lógica nueva: petición al backend
            try {
              const res = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user, password: pass })
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setLoginFade(true);
                setTimeout(() => {
                  setIsLoggedIn(true);
                  setLoginFade(false);
                }, 700);
              } else {
                setLoginError(data.error || "Usuario o contraseña incorrectos");
              }
            } catch (err) {
              setLoginError("No se pudo conectar con el backend");
            }
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>Iniciar sesión</h2>
          <label style={{ color: '#fff' }}>Usuario</label>
          <input
            type="text"
            value={loginUser}
            onChange={e => setLoginUser(e.target.value)}
            placeholder="Usuario"
            style={{ background: '#23263a', color: '#fff', border: '1.5px solid #9b0018', borderRadius: 5, padding: '10px 12px', fontSize: 16, marginBottom: 8 }}
            autoFocus
          />
          <label style={{ color: '#fff' }}>Contraseña</label>
          <input
            type="password"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
            placeholder="Contraseña"
            style={{ background: '#23263a', color: '#fff', border: '1.5px solid #9b0018', borderRadius: 5, padding: '10px 12px', fontSize: 16, marginBottom: 8 }}
          />
          {loginError && <div style={{ color: '#ff1744', background: '#4f1f1f', borderRadius: 5, padding: 8, marginBottom: 8, textAlign: 'center' }}>{loginError}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              style={{ flex: 1, background: '#9b0018', color: '#fff', border: 'none', borderRadius: 6, height: 40, fontSize: 17, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#680010')}
              onMouseOut={e => (e.currentTarget.style.background = '#9b0018')}
            >
              Entrar
            </button>
            <button
              type="button"
              style={{ flex: 1, background: '#9b0018', color: '#fff', border: 'none', borderRadius: 6, height: 40, fontSize: 17, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onClick={() => {
                setIsLoggedIn(true);
                setLoginError("");
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#680010')}
              onMouseOut={e => (e.currentTarget.style.background = '#9b0018')}
            >
            Invitado
            </button>
          </div>
          <GoogleLoginButton onLogin={(user) => {
            setIsLoggedIn(true);
            console.log("Usuario logueado con Google:", user);
          }} />
          <button
            type="button"
            style={{ background: 'none', color: '#75baff', border: 'none', marginTop: 8, cursor: 'pointer', textDecoration: 'underline', fontSize: 15 }}
            onClick={() => {
              setRegisterAnim("show-register");
              setShowRegister(true);
              setRegisterError("");
              setRegisterSuccess("");
            }}
          >
            Crear una cuenta
          </button>

        </form>
        {/* Registro */}
        {showRegister && (
          <form
            className={`login-form ${registerAnim}`}
            style={{
              background: '#181c27',
              border: '2px solid #9b0018',
              borderRadius: 10,
              boxShadow: '0 0 24px #000',
              padding: 36,
              minWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              color: '#fff',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
            onAnimationEnd={() => {
              if (registerAnim === "hide-register") {
                setShowRegister(false);
              }
              setRegisterAnim("");
            }}
            onSubmit={async e => {
              e.preventDefault();
              if (!registerUser.trim() || !registerPass.trim()) {
                setRegisterError('Completa todos los campos');
                setRegisterSuccess("");
                return;
              }
              // Nuevo: petición al backend para registrar usuario
              try {
                const res = await fetch("http://127.0.0.1:5000/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username: registerUser.trim().toLowerCase(), password: registerPass })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setRegisterSuccess('Cuenta creada');
                  setRegisterError("");
                  setRegisterUser("");
                  setRegisterPass("");
                  setTimeout(() => setShowRegister(false), 1500);
                } else {
                  setRegisterError(data.error || 'No se pudo crear la cuenta');
                  setRegisterSuccess("");
                }
              } catch (err) {
                setRegisterError('No se pudo conectar con el backend');
                setRegisterSuccess("");
              }
            }}
          >
            <h2 style={{ color: '#fff', marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>Crear cuenta</h2>
            <label style={{ color: '#fff' }}>Usuario</label>
            <input
              type="text"
              value={registerUser}
              onChange={e => setRegisterUser(e.target.value)}
              placeholder="Usuario nuevo"
              style={{ background: '#23263a', color: '#fff', border: '1.5px solid #9b0018', borderRadius: 5, padding: '10px 12px', fontSize: 16, marginBottom: 8 }}
              autoFocus
            />
            <label style={{ color: '#fff' }}>Contraseña</label>
            <input
              type="password"
              value={registerPass}
              onChange={e => setRegisterPass(e.target.value)}
              placeholder="Contraseña nueva"
              style={{ background: '#23263a', color: '#fff', border: '1.5px solid #9b0018', borderRadius: 5, padding: '10px 12px', fontSize: 16, marginBottom: 8 }}
            />
            {registerError && <div style={{ color: '#ff1744', background: '#4f1f1f', borderRadius: 5, padding: 8, marginBottom: 8, textAlign: 'center' }}>{registerError}</div>}
            {registerSuccess && <div style={{ color: '#00e676', background: '#1f4f2f', borderRadius: 5, padding: 8, marginBottom: 8, textAlign: 'center' }}>{registerSuccess}</div>}
            <button
              type="submit"
              style={{ background: '#9b0018', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontSize: 17, fontWeight: 600, cursor: 'pointer', marginTop: 8, transition: 'background 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#680010')}
              onMouseOut={e => (e.currentTarget.style.background = '#9b0018')}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              style={{ background: 'none', color: '#75baff', border: 'none', marginTop: 8, cursor: 'pointer', textDecoration: 'underline', fontSize: 15 }}
              onClick={() => {
                setRegisterAnim("hide-register");
                }}
              >
                Cancelar
              </button>
              </form>
            )}
            </div>
            <div className={`app-container${loginFade || !isLoggedIn ? '' : ' main-fade-in'}${isHistoryOpen ? ' history-open' : ''}`}
            style={{
              opacity: loginFade || !isLoggedIn ? 0 : 1,
              pointerEvents: loginFade || !isLoggedIn ? 'none' : 'auto',
              transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
              position: 'relative',
              zIndex: 1
            }}
            >
            <nav className="navbar">
              <button
              className="toggle-history-btn"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              >
              {isHistoryOpen ? "✖" : "☰"}
              </button>
              <h1>QueryCraft</h1>
              <button
                style={{
                  marginLeft: "auto",
                  background: lightTheme ? "#fff" : "#181c27",
                  color: lightTheme ? "#23263a" : "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: 8,
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "none",
                  transition: "background 0.3s, color 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setLightTheme((v) => !v)}
                title={lightTheme ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
              >
                {lightTheme ? (
                  // Moon icon SVG
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>
                ) : (
                  // Sun icon SVG
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                )}
              </button>
              <button
                style={{
                  marginLeft: 12,
                  background: lightTheme ? "#fff" : "#181c27",
                  color: lightTheme ? "#23263a" : "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: 8,
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "none",
                  transition: "background 0.3s, color 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}
                onClick={() => setShowUserPanel(v => !v)}
                title="Usuario"
              >
                {/* Person icon SVG */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
              </button>
              {/* User panel dropdown */}
              {showUserPanel && (
                <div
                  style={{
                    position: "absolute",
                    top: 48,
                    right: 0,
                    background: lightTheme ? "#fff" : "#181c27",
                    color: lightTheme ? "#23263a" : "#fff",
                    border: `1.5px solid ${lightTheme ? '#9b0018' : '#fff'}`,
                    borderRadius: 8,
                    boxShadow: "0 4px 24px #000a",
                    minWidth: 180,
                    zIndex: 100,
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    animationName: userPanelFade ? "fadeOutMsg" : "fadeInMsg",
                    animationDuration: "0.35s",
                    animationFillMode: "forwards"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
                    {loginUser || 'Invitado'}
                  </div>
                  <button
                    style={{
                      background: '#9b0018',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 0',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => {
                      setIsLoggedIn(false);
                      setUserPanelFade(true);
                      setTimeout(() => {
                        setShowUserPanel(false);
                        setUserPanelFade(false);
                        setLoginUser("");
                        setLoginPass("");
                      }, 350);
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </nav>

            <aside className={`side-menu ${isHistoryOpen ? "open" : ""}`}>
              {/* Título principal */}
              <div style={{ color: lightTheme ? "#23263a" : "#fff", marginBottom: 30 }}>
              <h1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🖥️</span>
                <span style={{ color: lightTheme ? "#23263a" : "#fff", transition: "color 0.3s" }}>Historial</span>
                <button
                style={{
                  background: "none",
                  border: "none",
                  color: lightTheme ? "#23263a" : "#fff",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: "50%",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Refrescar bases de datos"
                onClick={() => {
                fetch('http://127.0.0.1:5000/databases')
                  .then(res => res.json())
                  .then(data => setDatabases(data.databases || []))
                  .catch(() => setDatabases([]));
                fetch(`http://127.0.0.1:5000/tables?db=${expandedDb}`)
                  .then(res => res.json())
                  .then(data => {
                    setTablesByDb(prev => ({ ...prev, [expandedDb]: data.tables || [] }));
                    setLoadingTables(prev => ({ ...prev, [expandedDb]: false }));
                  })
                  .catch(() => {
                    setTablesByDb(prev => ({ ...prev, [expandedDb]: [] }));
                    setLoadingTables(prev => ({ ...prev, [expandedDb]: false }));
                  });
                  // Si hay una tabla seleccionada, refresca sus columnas
                    if (selectedDb && selectedTable) {
                      fetch(`http://127.0.0.1:5000/columns?db=${selectedDb}&table=${selectedTable}`)
                        .then(res => res.json())
                        .then(data => {
                          setSelectedTableColumns(data.columns || []);
                        })
                        .catch(() => {
                          setSelectedTableColumns([]);
                        });
                    } else {
                      // Si no hay tabla seleccionada, limpia columnas
                      setSelectedTableColumns([]);
                      setSelectedTable(null);
                      setSelectedDb(null);
                    }
                  }}
              onMouseOver={e => e.currentTarget.style.background = "#23263a"}
              onMouseOut={e => e.currentTarget.style.background = "none"}
            >
              <img
                src="https://img.icons8.com/ios-filled/24/ffffff/refresh--v1.png"
                alt="Refrescar"
                style={{ width: 18, height: 18, display: "block" }}
              />
            </button>
          </h1>
        </div>
        

          {/* Carpeta Databases */}
          <button
            className="history-btn"
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "1.1em",
              marginBottom: 8
            }}
            onClick={() => setIsDbListOpen(!isDbListOpen)}
            title="Mostrar bases de datos"
          >
            <span style={{ fontSize: 18 }}>{isDbListOpen ? "📂" : "📁"}</span>
            Databases
          </button>


          {/* Lista de bases de datos y tablas */}
          {isDbListOpen && (
          <div style={{ marginLeft: 16, borderLeft: "2px solid #333", paddingLeft: 8 }}>
            {databases.length === 0 ? (
              <p style={{ fontSize: "0.95em" }}>No hay bases de datos.</p>
            ) : (
              databases.map((db) => (
                <div key={db}>
                  <button
                    className="history-btn"
                    style={{
                      fontWeight: expandedDb === db ? "bold" : "normal",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                    onClick={() => setExpandedDb(expandedDb === db ? null : db)}
                    title={`Ver tablas de ${db}`}
                  >
                    <span style={{ fontSize: 16 }}>
                      {expandedDb === db ? "📂" : "📁"}
                    </span>
                    {db}
                  </button>
                  {expandedDb === db && (
                  <div style={{ marginLeft: 16, borderLeft: "2px solid #333", paddingLeft: 8 }}>
                    {loadingTables[db] ? (
                      <p style={{ fontSize: "0.9em" }}>Cargando tablas...</p>
                    ) : tablesByDb[db] && tablesByDb[db].length > 0 ? (
                          tablesByDb[db].map((table) => (
                            <div key={table}>
                              <button
                                className="history-btn"
                                style={{
                                  fontSize: "0.95em",
                                  margin: "3px 0",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6
                                }}
                                title={`Ver columnas de ${table}`}
                                onClick={() => handleShowColumns(db, table)}
                              >
                                <span style={{ fontSize: 15 }}>🗒️</span>
                                {table}
                              </button>
                              {/* Mostrar columnas si esta tabla está seleccionada */}
                              {selectedTable === table && selectedDb === db && selectedTableColumns.length > 0 && (
                                <ul style={{ margin: "4px 0 4px 24px", padding: 0, color: "#bfc7d5", fontSize: "0.97em" }}>
                                  {selectedTableColumns.map(col => (
                                    <li key={col.name} style={{ listStyle: "disc", marginLeft: 12, position: 'relative' }}>
                                      <span
                                        className="sidebar-col-tooltip custom-tooltip-trigger"
                                        tabIndex={0}
                                        onMouseMove={e => {
                                          setColTooltip({
                                            visible: true,
                                            x: e.clientX + 14,
                                            y: e.clientY + 8,
                                            text: col.type
                                          });
                                        }}
                                        onMouseLeave={() => setColTooltip(t => ({ ...t, visible: false }))}
                                        onFocus={e => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setColTooltip({
                                            visible: true,
                                            x: rect.right + 14,
                                            y: rect.top + rect.height / 2,
                                            text: col.type
                                          });
                                        }}
                                        onBlur={() => setColTooltip(t => ({ ...t, visible: false }))}
                                      >
                                        {col.name}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: "0.9em" }}>No hay tablas.</p>
                        )}
                  </div>
                )}


                </div>
              ))
            )}
          </div>
        )}

        </aside>

        <div className="main-content">
          <div className="left-panel" style={{ width: `${leftWidth}%` }}>
            <div className="query-input">
              <SqlEditor query={query} setQuery={setQuery} />
              <div className="buttons-row">
                <button onClick={handleExtract} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v18l15-9-15-9z" /></svg>

                </button>
                <label  
                  className="upload-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    setShowUpload(true);
                    setUploadAnim("fade-in-up");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>

                </label>
                
                
                {showUpload && (
                  <div className="modal-bg">
                    <div className={`modal modal-appear${uploadAnim ? " " + uploadAnim : ""}`}
      onAnimationEnd={() => setUploadAnim("")}
                    >
                      <h3>Subir CSV</h3>
                      <div>
                        <label>Base de datos existente:</label>
                        <select value={selectedDb} onChange={e => setSelectedDb(e.target.value)}>
                          <option value="">-- Selecciona --</option>
                          {databases.map(db => <option key={db} value={db}>{db}</option>)}
                        </select>
                      </div>
                      <div>
                        <label>O crea nueva base:</label>
                        <input name="new-db" value={newDb} onChange={e => setNewDb(e.target.value)} placeholder="Nueva base" />
                      </div>
                      <div>
                        <label>Nombre de la tabla:</label>
                        <input name="table-name" value={tableName} onChange={e => setTableName(e.target.value)} placeholder="Nombre tabla" />
                      </div>
                      <div>
                        <label>Archivo CSV:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            className="upload-btn"
                            style={{ minWidth: 120, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            onClick={() => {
                              setUploadingCsv(true);
                              document.getElementById('modal-upload-csv').click();
                              // Si no se selecciona archivo, ocultar spinner tras 1s
                              setTimeout(() => setUploadingCsv(false), 1000);
                            }}
                            disabled={uploadingCsv}
                          >
                            {uploadingCsv && (
                              <span style={{
                                display: 'inline-block',
                                width: 18,
                                height: 18,
                                border: '2.5px solid #fff',
                                borderTop: '2.5px solid #9b0018',
                                borderRadius: '50%',
                                animation: 'spin-csv-btn 0.7s linear infinite',
                                marginRight: 4
                              }} />
                            )}
                            Seleccionar archivo
                          </button>
                          <span style={{ color: '#bfc7d5', fontSize: '0.98em', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                            {csvFile ? csvFile.name : 'Ningún archivo seleccionado'}
                          </span>
                          <input
                            type="file"
                            id="modal-upload-csv"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={e => {
                              setCsvFile(e.target.files[0]);
                              setUploadingCsv(false);
                            }}
                          />
                        </div>
                      </div>
                      <button onClick={handleUploadCsv}>Subir</button>
                      <button onClick={() => setShowUpload(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="resizer" onMouseDown={startDragging} />

          <div className="right-panel" style={{ width: `${100 - leftWidth}%` }}>
            <div className="top-section">
              <div className="results-panel">
                {result && result.columns && result.rows ? (
                  <table>
                    <thead>
                      <tr>
                        {result.columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, idx) => (
                        <tr key={idx}>
                          {result.columns.map((col) => (
                            <td key={col}>{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : result && result.message ? (
                  null
                ) : result ? (
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                ) : (
                  null
                )}
              </div>

              <div className="errors-panel">
                {error ? (
                  <div className={`message-error${fadeError ? ' fade-out-msg' : ''} fade-in-msg`}>{error}</div>
                ) : result && (result.rows_affected !== undefined || result.execution_time !== undefined || result.source === "cache") ? (
                  <div className="message-success fade-in-msg" style={result.source === "cache" ? { background: "#23263a", color: "#00e676", fontWeight: 600 } : {}}>
                    {result.source === "cache" && (
                      <span>Resultado obtenido del cache<br /></span>
                    )}
                    {result.rows_affected !== undefined && (
                      <span>{result.rows_affected} filas afectadas<br /></span>
                    )}
                    {result.execution_time !== undefined && (
                      <span>Tiempo de ejecución: {result.execution_time.toFixed(4)} s</span>
                    )}
                    {result.message && (
                      <><br />{result.message}</>
                    )}
                  </div>
                ) : result && result.message ? (
                  <div className={`message-success fade-in-msg`}>{result.message}</div>
                ) : null}
              </div>

            </div>
          </div>
        </div>
      </div>
      {/* Portal para tooltip de columna */}
      <TooltipPortal visible={colTooltip.visible} x={colTooltip.x} y={colTooltip.y}>
        {colTooltip.text}
      </TooltipPortal>
    </>
  );
}

export default App;

// Animación spinner para el botón de subir CSV
// Puedes poner esto en App.css si prefieres
const spinnerStyle = document.createElement('style');
spinnerStyle.innerHTML = `@keyframes spin-csv-btn { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
document.head.appendChild(spinnerStyle);

// Animación para el panel de usuario
const userPanelAnimStyle = document.createElement('style');
userPanelAnimStyle.innerHTML = `@keyframes showUserPanelAnim {
  0% { opacity: 0; transform: translateY(-18px) scale(0.95); filter: blur(6px); }
  60% { opacity: 1; transform: translateY(6px) scale(1.04); filter: blur(1.5px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}`;
document.head.appendChild(userPanelAnimStyle);