
import React, { useEffect, useState } from 'react';
import './App.css';
import Login from "./Login";
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
  const [loginTokenContract, setLoginTokenContract] = useState(""); // Nuevo estado para el token contract

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


  // Función para manejar login (yo digo que crear un json para ese usuario)
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

// LOGIN
return (
  <>
    {!isLoggedIn ? (
      <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    ) : (
      <div
        className={`app-container${loginFade ? ' fade' : ''}`}
        style={{
          opacity: loginFade ? 0 : 1,
          transition: 'opacity 0.7s ease',
        }}
      >

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
                    <a
                      href={`http://localhost:${microservice.port}/${microservice.endpoint}?a=5&b=7`}
                      target="_blank"
                      rel="noopener noreferrer"
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
                      onMouseOver={e => (e.currentTarget.style.background = '#1761c7')}
                      onMouseOut={e => (e.currentTarget.style.background = '#1a73e8')}
                    >
                      Ver Endpoint
                    </a>
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
                type="text"s
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
    )}
  </>
);
//}
}

export default PanelPrincipal;
