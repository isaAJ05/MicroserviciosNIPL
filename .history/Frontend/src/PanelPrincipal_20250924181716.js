import React, { useEffect, useState } from 'react';
import './App.css'; // Asegúrate de tener estilos para la tabla y el layout
import { useHistory } from 'react-router-dom';

function PanelPrincipal() {
  const [microservices, setMicroservices] = useState([]);
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = localStorage.getItem("lightTheme");
    return saved === "true";
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [user, setUser] = useState(null);

  const history = useHistory();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/microservices') // Cambia la URL según tu backend
      .then(res => res.json())
      .then(data => setMicroservices(data.microservices || []))
      .catch(err => console.error('Error fetching microservices:', err));
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    history.push('/login'); // Redirige a la página de login
  };

  return (
    <div className={`app-container${lightTheme ? ' light-theme' : ''}`}>
      <nav className="navbar">
        <h1>Microservicios</h1>
        <button onClick={() => setLightTheme(prev => !prev)}>
          {lightTheme ? '🌙' : '☀️'}
        </button>
        <button onClick={() => setShowUserPanel(prev => !prev)}>
          {user ? user.username : 'Invitado'}
        </button>
        {showUserPanel && (
          <div className="user-panel">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </nav>

      <aside className="side-menu">
        {/* Aquí puedes agregar enlaces a otras secciones de la aplicación */}
      </aside>

      <main className="main-content">
        <h2>Lista de Microservicios</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo de Procesamiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {microservices.map(microservice => (
              <tr key={microservice.id}>
                <td>{microservice.id}</td>
                <td>{microservice.name}</td>
                <td>{microservice.processingType}</td>
                <td>{microservice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default PanelPrincipal;