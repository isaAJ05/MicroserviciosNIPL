
import React, { useEffect, useState, useRef } from 'react';
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
  const [dockerActive, setDockerActive] = useState(null); // verificacion
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeToShow, setCodeToShow] = useState("");
  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginFade, setLoginFade] = useState(false);
  // Para la sidebar
  const [isPinned, setIsPinned] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  // Para modal de respuesta de endpoint
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [endpointResponse, setEndpointResponse] = useState(null);
  const [endpointUrl, setEndpointUrl] = useState("");
  // Para modal personalizado de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [microserviceToDelete, setMicroserviceToDelete] = useState(null);
  // Para toast de éxito (eliminación)
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // Para toast de éxito (renovación de token)
  const [showRenewTokenToast, setShowRenewTokenToast] = useState(false);
    // Estado para modal de renovar token
  const [showRenewTokenModal, setShowRenewTokenModal] = useState(false);
  const [renewTokenPassword, setRenewTokenPassword] = useState("");
  const [renewTokenProjectId, setRenewTokenProjectId] = useState(localStorage.getItem('tokenContract') || "");
 // Estado para modal de edición de URL de endpoint
  const [showEditEndpointUrlModal, setShowEditEndpointUrlModal] = useState(false);
  const [editEndpointUrlValue, setEditEndpointUrlValue] = useState("");

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
      setIsLoggedIn(true);
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

    // Consulta el estado de Docker al montar el componente
 useEffect(() => {
  console.log("Consultando estado de Docker...");
  fetch('http://127.0.0.1:5000/is_docker_active')
    .then(res => res.json())
    .then(data => {
      console.log("Respuesta Docker:", data);
      setDockerActive(data.active);
    })
    .catch((err) => {
      console.error("Error consultando Docker:", err);
      setDockerActive(false);
    });
}, []);

  //CLIC FUERA DE SIDEBAR
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isPinned
      ) {
        setIsHistoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPinned]);

  // Función para manejar login (yo digo que crear un json para ese usuario)
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
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

  // CRUD: Eliminar microservicio (ahora con modal personalizado)
  const handleDelete = async () => {
    if (!microserviceToDelete) return;
    await fetch(`http://127.0.0.1:5000/microservices/${microserviceToDelete}`, { method: 'DELETE' });
    setMicroservices(microservices.filter(m => m.id !== microserviceToDelete));
    setShowDeleteModal(false);
    setMicroserviceToDelete(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
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
      <Login
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        handleLogin={handleLogin}
      />
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
          {isHistoryOpen ? "☰" : "☰"}
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
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
              {(user && (user.username || user.name || user.email)) || 'Invitado'}
            </div>
            <div style={{ fontSize: 13, color: lightTheme ? '#656d76' : '#b3b3b3', marginBottom: 6, marginLeft: 28 }}>
              Project ID: {localStorage.getItem('tokenContract') || 'N/A'}
            </div>
            <button
              style={{
                background: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 0',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginBottom: 8
              }}
              onClick={() => setShowRenewTokenModal(true)}
            >
              Renovar token
            </button>
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
<aside
  ref={sidebarRef}
  className={`side-menu${isHistoryOpen ? " open" : ""}`}
>
  <div className="sidebar-controls">
    <button
      onClick={() => setIsHistoryOpen(!isHistoryOpen)}
      title={isHistoryOpen ? "Cerrar" : "Abrir"}
    >
      ❌
    </button>
  </div>

  {isHistoryOpen && (
    <ul className="sidebar-list">
      <li>🏠 Inicio</li>
      <li>⚙️ Configuración</li>
      <li>📜 Historial</li>
    </ul>
  )}
</aside>




      

      {/* Toast de éxito al eliminar */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: lightTheme ? '#1aaf5d' : '#23263a',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 4px 24px #0005',
          zIndex: 9999,
          letterSpacing: 0.2,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span role="img" aria-label="éxito">✅</span> Eliminado correctamente
        </div>
      )}
      {/* Toast de éxito al renovar token */}
      {showRenewTokenToast && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: lightTheme ? '#1aaf5d' : '#23263a',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 4px 24px #0005',
          zIndex: 9999,
          letterSpacing: 0.2,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span role="img" aria-label="éxito">✅</span> Token renovado correctamente
        </div>
      )}
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
                    const token = (localStorage.getItem('accessToken')).trim();
                    const tokenContract = (localStorage.getItem('tokenContract')).trim();
                    let url = `http://localhost:${microservice.port}/${microservice.endpoint}`;
                    if (microservice.processing_type === "Roble") {
                      url += `?tableName=inventario&token_contract=${encodeURIComponent(tokenContract)}`;
                    }
                    setEditEndpointUrlValue(url);
                    setShowEditEndpointUrlModal(true);
                  }}

                                    onMouseOver={e => (e.currentTarget.style.background = '#1761c7')}
                                    onMouseOut={e => (e.currentTarget.style.background = '#1a73e8')}
                                  >
                                    Probar Endpoint
                                    </button>
                                  </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="action-btn"
                        title="Ver código"
                        onClick={async () => {
                          setCodeToShow("Cargando...");
                          setShowCodeModal(true);
                          try {
                            const res = await fetch(`http://127.0.0.1:5000/microservices/${microservice.id}/mainpy`);
                            if (!res.ok) throw new Error("No se pudo obtener el código");
                            const data = await res.json();
                            setCodeToShow(data.code || "Sin código disponible");
                          } catch (err) {
                            setCodeToShow("Error al obtener el código: " + err.message);
                          }
                        }}
                      >
                    <span role="img" aria-label="Ver código">👁️</span>
                  </button>
                  <button className="action-btn" title="Editar" onClick={() => setEditId(microservice.id)}>✏️</button>
                  <button className="action-btn" title="Eliminar" onClick={() => { setShowDeleteModal(true); setMicroserviceToDelete(microservice.id); }}>🗑️</button>
      {/* Modal personalizado para eliminar microservicio */}
      {showDeleteModal && (
        <div className="modal-bg" style={{ 
          zIndex: 210, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: lightTheme 
            ? 'rgba(255,255,255,0.65)' 
            : 'rgba(30,34,45,0.45)',
          backdropFilter: 'blur(2.5px)',
          WebkitBackdropFilter: 'blur(2.5px)'
        }}>
          <div className="modal" style={{ width: 400, maxWidth: '90vw', minWidth: 280, padding: 28, textAlign: 'center' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
              <span role="img" aria-label="Eliminar">⚠️</span> Confirmar Eliminación
            </h3>
            <div style={{ fontSize: 16, marginBottom: 22 }}>
              ¿Estás seguro de que deseas eliminar este microservicio?
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                className="action-btn"
                style={{ background: '#b91c1c', color: '#fff', fontWeight: 600, minWidth: 90 }}
                onClick={handleDelete}
              >
                Eliminar
              </button>
              <button
                className="action-btn"
                style={{ background: '#23263a', minWidth: 90 }}
                onClick={() => { setShowDeleteModal(false); setMicroserviceToDelete(null); }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

           {/* AVISO DOCKER AQUÍ */}
  <div
    style={{
      margin: "20px auto 20px auto",
      background: dockerActive ? "#1aaf5d" : "#b91c1c",
      color: "#ffffffff",
      padding: "8px 0px",
      borderRadius: 12,
      boxShadow: "0 4px 16px #0003",
      fontWeight: 600,
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 180,
      maxWidth: 210,
      justifyContent: "center"
    }}
  >

    <span style={{ fontSize: 20 }}>
      {dockerActive === null ? "⏳" : dockerActive ? "🐳" : "❌"}
    </span>
    Docker:{" "}
    {dockerActive === null
      ? "Verificando..."
      : dockerActive
      ? "Conectado"
      : "No conectado"}
    </div>     

      </div>
      
      </div>

      {/* Modal para respuesta de endpoint */}
      {showEndpointModal && (
        <div className="modal-bg" style={{ 
          zIndex: 201, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: lightTheme 
            ? 'rgba(255,255,255,0.65)' 
            : 'rgba(30,34,45,0.45)',
          backdropFilter: 'blur(2.5px)',
          WebkitBackdropFilter: 'blur(2.5px)'
        }}>
          <div className="modal" style={{ width: 600, maxWidth: '90vw', minWidth: 350, padding: 28 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span role="img" aria-label="Respuesta">🔗</span> Respuesta del Endpoint
            </h3>
            <div style={{
              marginBottom: 14,
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
              flexWrap: 'wrap',
              wordBreak: 'break-all',
              overflowWrap: 'anywhere'
            }}>
              <span style={{ color: lightTheme ? '#1a73e8' : '#75baff', whiteSpace: 'nowrap' }}>GET</span>
              <span style={{ color: lightTheme ? '#ffb300' : '#ffb300', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{endpointUrl}</span>
            </div>
            <pre style={{
              background: lightTheme ? '#fff' : '#0d1117',
              color: lightTheme ? '#1f2328' : '#e6edf3',
              padding: 18,
              borderRadius: 8,
              fontSize: 15,
              maxHeight: 400,
              overflow: 'auto',
              marginBottom: 18,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
              lineHeight: '1.45',
              minHeight: '100%',
              boxSizing: 'border-box',
              width: '100%'
            }}>{typeof endpointResponse === 'string' ? endpointResponse : JSON.stringify(endpointResponse, null, 2)}</pre>
            <button
              className="action-btn"
              style={{ background: '#23263a', marginLeft: 'auto', display: 'block' }}
              onClick={() => setShowEndpointModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {/* Modal para ver código */}
      {showCodeModal && (
        <div className="modal-bg" style={{ 
          zIndex: 200, 
          background: lightTheme 
            ? 'rgba(255,255,255,0.65)' 
            : 'rgba(30,34,45,0.45)',
          backdropFilter: 'blur(2.5px)',
          WebkitBackdropFilter: 'blur(2.5px)'
        }}>
          <div className="modal" style={{ maxWidth: 700, minWidth: 350 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="Ver código">👁️</span> Código del Microservicio
            </h3>
            <pre style={{
              background: lightTheme ? '#fff' : '#0d1117',
              color: lightTheme ? '#1f2328' : '#e6edf3',
              padding: 18,
              borderRadius: 8,
              fontSize: 15,
              maxHeight: 400,
              overflow: 'auto',
              marginBottom: 18,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
              lineHeight: '1.45',
              minHeight: '100%'
            }}>{codeToShow}</pre>
            <button
              className="action-btn"
              style={{ background: '#23263a', marginLeft: 'auto', display: 'block' }}
              onClick={() => setShowCodeModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {/* Modal para agregar microservicio */}
      {showAddModal && (
        <div className="modal-bg" style={{ 
          background: lightTheme 
            ? 'rgba(255,255,255,0.65)' 
            : 'rgba(30,34,45,0.45)',
          backdropFilter: 'blur(2.5px)',
          WebkitBackdropFilter: 'blur(2.5px)'
        }}>
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
           {/* Modal para renovar token */}
    {showRenewTokenModal && (
      <div className="modal-bg" style={{
        zIndex: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: lightTheme ? 'rgba(255,255,255,0.65)' : 'rgba(30,34,45,0.45)',
        backdropFilter: 'blur(2.5px)',
        WebkitBackdropFilter: 'blur(2.5px)'
      }}>
        <div className="modal" style={{ width: 400, maxWidth: '90vw', minWidth: 280, padding: 28, textAlign: 'center' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
            <span role="img" aria-label="Renovar">🔑</span> Renovar Token
          </h3>
          <form
            onSubmit={async e => {
              e.preventDefault();
              const email = (user && (user.username || user.name || user.email) || '').trim().toLowerCase();
              const pass = renewTokenPassword.trim();
              const token = renewTokenProjectId.trim();
              // Opcional: podrías agregar un estado de error y loading
              try {
                const res = await fetch("http://127.0.0.1:5000/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email,
                    password: pass,
                    token_contract: token,
                  }),
                });
                const data = await res.json();
                if (res.ok && data.accessToken) {
                  localStorage.setItem("accessToken", data.accessToken);
                  localStorage.setItem("tokenContract", token);
                  setShowRenewTokenModal(false);
                  setRenewTokenPassword("");
                  setRenewTokenProjectId(token);
                  // Feedback visual: toast de renovación
                  setShowRenewTokenToast(true);
                  setTimeout(() => setShowRenewTokenToast(false), 2000);
                } else {
                  alert(data.error || "No se pudo renovar el token");
                }
              } catch (err) {
                alert("No se pudo conectar con el backend");
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <label style={{ fontWeight: 600 }}>Usuario</label>
              <input
                type="text"
                value={user ? (user.username || user.name || user.email) : ''}
                disabled
                style={{ width: '100%', borderRadius: 6, padding: 8, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <label style={{ fontWeight: 600 }}>ID del Proyecto</label>
              <input
                type="text"
                value={renewTokenProjectId}
                onChange={e => setRenewTokenProjectId(e.target.value)}
                required
                style={{ width: '100%', borderRadius: 6, padding: 8, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <label style={{ fontWeight: 600 }}>Contraseña</label>
              <input
                type="password"
                value={renewTokenPassword}
                onChange={e => setRenewTokenPassword(e.target.value)}
                required
                style={{ width: '100%', borderRadius: 6, padding: 8, border: '1px solid #ccc', background: '#fff', color: '#23263a' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'center' }}>
              <button type="submit" className="action-btn">
                Renovar
              </button>
              <button type="button" className="action-btn" style={{ background: '#23263a' }} onClick={() => { setShowRenewTokenModal(false); setRenewTokenPassword(""); setRenewTokenProjectId(localStorage.getItem('tokenContract') || ""); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
{/* Modal para editar la URL del endpoint antes de probar */}
          {showEditEndpointUrlModal && (
            <div className="modal-bg" style={{
              zIndex: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: lightTheme ? 'rgba(255,255,255,0.65)' : 'rgba(30,34,45,0.45)',
              backdropFilter: 'blur(2.5px)',
              WebkitBackdropFilter: 'blur(2.5px)'
            }}>
              <div className="modal" style={{ width: 500, maxWidth: '90vw', minWidth: 280, padding: 28, textAlign: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
                  <span role="img" aria-label="Editar">✏️</span> Editar URL del Endpoint
                </h3>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const customUrl = editEndpointUrlValue.trim();
                    if (!customUrl) return;
                    setShowEditEndpointUrlModal(false);
                    setEndpointUrl(customUrl);
                    setEndpointResponse("Cargando...");
                    setShowEndpointModal(true);
                    try {
                      const token = (localStorage.getItem('accessToken') || '').trim();
                      const res = await fetch(customUrl, {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                      }
                      const data = await res.json();
                      setEndpointResponse(data);
                    } catch (err) {
                      setEndpointResponse("Error al conectar con el microservicio: " + err.message);
                    }
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <label style={{ fontWeight: 600, marginBottom: 6, textAlign: 'left' }}>URL del Endpoint</label>
                  <input
                    type="text"
                    value={editEndpointUrlValue}
                    onChange={e => setEditEndpointUrlValue(e.target.value)}
                    required
                    style={{ width: '100%', borderRadius: 6, padding: 8, border: '1px solid #ccc' }}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'center' }}>
                    <button type="submit" className="action-btn">
                      Probar Endpoint
                    </button>
                    <button type="button" className="action-btn" style={{ background: '#23263a' }} onClick={() => setShowEditEndpointUrlModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>

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

}

export default PanelPrincipal;
