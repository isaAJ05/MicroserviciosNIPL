import React, { useEffect, useState } from 'react';
import './PanelPrincipal.css';
import './App.css';
import AgregarMicroservicio from './AgregarMicroservicio';

function PanelPrincipal() {
  const [microservices, setMicroservices] = useState([]);
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = localStorage.getItem("lightTheme");
    return saved === "true";
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [userPanelFade, setUserPanelFade] = useState(false);
  const [user, setUser] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMicroservice, setShowAddMicroservice] = useState(false);
  const [newMicroservice, setNewMicroservice] = useState({
    name: "",
    processing_type: "",
    code: ""
  });

  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginFade, setLoginFade] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerUser, setRegisterUser] = useState("");
  const [registerPass, setRegisterPass] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerAnim, setRegisterAnim] = useState("");

  useEffect(() => {
    fetch('http://127.0.0.1:5000/microservices')
      .then(res => res.json())
      .then(data => setMicroservices(data.microservices || data || []))
      .catch(err => console.error('Error fetching microservices:', err));
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const root = document.body;
    if (lightTheme) {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    localStorage.setItem("lightTheme", lightTheme);
  }, [lightTheme]);

  // Componente GoogleLoginButton
  function GoogleLoginButton({ onLogin }) {
    const divRef = React.useRef(null);

    React.useEffect(() => {
      if (window.google && divRef.current) {
        window.google.accounts.id.initialize({
          client_id: '',
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

  // Función para manejar login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // CRUD: Crear microservicio
  const handleAddMicroservice = async (e) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:5000/microservices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMicroservice)
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewMicroservice({ name: "", processing_type: "", code: "" });
      refreshMicroservices();
    }
  };

  // Función para refrescar la lista de microservicios
  const refreshMicroservices = () => {
    fetch('http://127.0.0.1:5000/microservices')
      .then(res => res.json())
      .then(data => setMicroservices(data.microservices || data || []))
      .catch(err => console.error('Error fetching microservices:', err));
  };

  // CRUD: Eliminar microservicio
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este microservicio?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/microservices/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error interno al eliminar el microservicio");
        return;
      }
      refreshMicroservices();
    } catch (err) {
      alert("No se pudo conectar con el backend");
    }
  };

  if (showAddMicroservice) {
    return (
      <AgregarMicroservicio 
        onBack={() => {
          setShowAddMicroservice(false);
          refreshMicroservices();
        }}
        lightTheme={lightTheme}
      />
    );
  }

  return (
    <>
      <div className="background-gradient" />
      <div className={`login-bg${loginFade ? ' fade-out' : ''}`}>
        <form
          className={`login-form${!showRegister ? ' login-fade-in' : ''}`}
          onSubmit={async e => {
            e.preventDefault();
            const user = loginUser.trim().toLowerCase();
            const pass = loginPass.trim();
            setLoginError("");
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
          <h2 className="login-title">Iniciar sesión</h2>
          <label>Usuario</label>
          <input
            type="text"
            value={loginUser}
            onChange={e => setLoginUser(e.target.value)}
            placeholder="Usuario"
            autoFocus
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
            placeholder="Contraseña"
          />
          {loginError && <div className="login-error">{loginError}</div>}
          <div className="login-btn-row">
            <button type="submit">Entrar</button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setLoginError("");
              }}
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
            className="login-register-btn"
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
        {showRegister && (
          <form
            className={`login-form ${registerAnim}`}
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
            <h2 className="login-title">Crear cuenta</h2>
            <label>Usuario</label>
            <input
              type="text"
              value={registerUser}
              onChange={e => setRegisterUser(e.target.value)}
              placeholder="Usuario nuevo"
              autoFocus
            />
            <label>Contraseña</label>
            <input
              type="password"
              value={registerPass}
              onChange={e => setRegisterPass(e.target.value)}
              placeholder="Contraseña nueva"
            />
            {registerError && <div className="login-error">{registerError}</div>}
            {registerSuccess && <div className="login-success">{registerSuccess}</div>}
            <button type="submit">Crear cuenta</button>
            <button
              type="button"
              className="login-register-btn"
              onClick={() => {
                setRegisterAnim("hide-register");
              }}
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
      <div className={`app-container${loginFade || !isLoggedIn ? '' : ' main-fade-in'}${isHistoryOpen ? ' history-open' : ''}`}>
        <nav className="navbar">
          <button
            className="toggle-history-btn"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            {isHistoryOpen ? "✖" : "☰"}
          </button>
          <h1>MicroDock</h1>
          <button
            className="theme-btn"
            onClick={() => setLightTheme((v) => !v)}
            title={lightTheme ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
          >
            {lightTheme ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
          <button
            className="user-btn"
            onClick={() => setShowUserPanel(v => !v)}
            title="Usuario"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
          </button>
          {showUserPanel && (
            <div className={`user-panel${userPanelFade ? ' fade-out' : ''}`}>
              <div className="user-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
                {loginUser || 'Invitado'}
              </div>
              <button
                className="logout-btn"
                onClick={() => {
                  setIsLoggedIn(false);
                  setUserPanelFade(true);
                  setTimeout(() => {
                    setShowUserPanel(false);
                    setUserPanelFade(false);
                    setLoginUser("");
                    setLoginPass("");
                    setUser(null);
                    localStorage.removeItem("user");
                  }, 350);
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>

        <aside className={`side-menu${isHistoryOpen ? " open" : ""}`}>
          {/* Puedes agregar aquí enlaces o menú lateral si lo necesitas */}
        </aside>

        <div className="panel-content">
          <div className="panel-header-row">
            <h2>Lista de Microservicios</h2>
            <button className="action-btn" onClick={() => setShowAddMicroservice(true)}>
              + Agregar Microservicio
            </button>
          </div>
          <div className="table-container">
            <table className="microservices-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo de Procesamiento</th>
                  <th>Estado</th>
                  <th>Endpoint</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {microservices.map(microservice => (
                  <tr key={microservice.id}>
                    <td>{microservice.id}</td>
                    <td>{microservice.name}</td>
                    <td>{microservice.processing_type}</td>
                    <td>
                      <span className={`status-badge ${microservice.status === "created" ? "status-yellow" : "status-green"}`}>
                        {microservice.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        title="Ver Endpoint"
                        onClick={() => window.open(`http://localhost:${microservice.port}/${microservice.endpoint}`, '_blank')}
                      >
                        Ver Endpoint
                      </button>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        title="Eliminar"
                        onClick={() => handleDelete(microservice.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="modal-bg">
            <div className="modal">
              <h3>Agregar Microservicio</h3>
              <form onSubmit={handleAddMicroservice}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newMicroservice.name}
                  onChange={e => setNewMicroservice({ ...newMicroservice, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Tipo de procesamiento"
                  value={newMicroservice.processing_type}
                  onChange={e => setNewMicroservice({ ...newMicroservice, processing_type: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Código Python"
                  value={newMicroservice.code}
                  onChange={e => setNewMicroservice({ ...newMicroservice, code: e.target.value })}
                  rows={5}
                  required
                />
                <div className="modal-btn-row">
                  <button type="submit" className="action-btn">Guardar</button>
                  <button type="button" className="action-btn cancel-btn" onClick={() => setShowAddModal(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="footer">
          <div>
            MicroDock NIPL &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
          </div>
          <div>
            <span>Contacto: microservicios@uninorte.edu.co</span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default PanelPrincipal;