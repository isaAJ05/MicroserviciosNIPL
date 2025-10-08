
import React, { useEffect, useState } from 'react';
import './App.css';
import AgregarMicroservicio from './AgregarMicroservicio';
import EditarMicroservicio from './EditarMicroservicio';
function PanelPrincipal() {
  const [microservices, setMicroservices] = useState([]);
  const [editId, setEditId] = useState(null);
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
      // Refresca la lista
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
    await fetch(`http://127.0.0.1:5000/microservices/${id}`, { method: 'DELETE' });
    setMicroservices(microservices.filter(m => m.id !== id));
  };

  // Si estamos en la vista de agregar microservicio, mostrar ese componente
  if (showAddMicroservice) {
    return (
      <AgregarMicroservicio 
        onBack={() => {
          setShowAddMicroservice(false);
          refreshMicroservices(); // Refrescar la lista cuando regresemos
        }}
        lightTheme={lightTheme}
      />
    );
  }
  if (editId) {
  return (
    <EditarMicroservicio
      id={editId}
      onBack={() => {
        setEditId(null);
        refreshMicroservices();
      }}
    />
  );
}

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
            try {
              const res = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user, password: pass }) // Usa email si Roble lo pide
              });
              const data = await res.json();
              if (res.ok && data.accessToken) {
                // Guarda el token en localStorage
                localStorage.setItem("accessToken", data.accessToken);
                setIsLoggedIn(true);
                setLoginFade(false);
                setUser({ email: user });
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
            }}>
      <nav className="navbar">
        <button
          className="toggle-history-btn"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          {isHistoryOpen ? "✖" : "☰"}
        </button>
        <h1>MicroServicios</h1>
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>
          ) : (
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
        </button>
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
          <h2 style={{ marginBottom: 0 }}>Lista de Microservicios</h2>
          <button className="action-btn" style={{ marginLeft: 'auto', fontWeight: 600 }} onClick={() => setShowAddMicroservice(true)}>
            + Agregar Microservicio
          </button>
        </div>
        <div className="table-container">
        <table className="microservices-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo de Procesamiento</th>
              <th>ID</th>
              <th>Imagen</th>
              <th>Puerto</th>
              <th>Estado</th>
              <th>Endpoint</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {microservices.map(microservice => (
              <tr key={microservice.id}>
                <td>{microservice.name}</td>
                <td>{microservice.processing_type}</td>
                <td>{microservice.id}</td>
                <td>{microservice.image_name}</td>
                <td>{microservice.port}</td>
                <td>
                  <span className={`status-badge ${microservice.status === "created" ? "status-yellow" : "status-green"}`}>
                    {microservice.status}
                  </span>
                </td>
                <td>
                <button
                  style={{
                    display: 'inline-block',
                    background: '#1a73e8',
                    color: '#fff',
                    padding: '7px 16px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px #0002',
                    transition: 'background 0.2s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    const token = localStorage.getItem('accessToken');
                    const url = `http://localhost:${microservice.port}/${microservice.endpoint}?tableName=inventario`;
                    const res = await fetch(url, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    const data = await res.json();
                    alert(JSON.stringify(data, null, 2)); // O muestra la respuesta en un modal bonito
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#1761c7')}
                  onMouseOut={e => (e.currentTarget.style.background = '#1a73e8')}
                >
                  Probar Endpoint
                </button>
              </td>
                <td>
                  <button className="action-btn" title="Editar" onClick={() => setEditId(microservice.id)}>✏️</button>
                  <button className="action-btn" title="Eliminar" onClick={() => handleDelete(microservice.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Modal para agregar microservicio */}
      {showAddModal && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Agregar Microservicio</h3>
            <form onSubmit={handleAddMicroservice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="action-btn">Guardar</button>
                <button type="button" className="action-btn" style={{ background: '#23263a' }} onClick={() => setShowAddModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div>
          MicroServicios NIPL &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
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