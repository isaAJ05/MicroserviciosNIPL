import React, { useEffect, useState } from 'react';
import './A.css'; // Asegúrate de tener estilos para la tabla y el layout
import { useHistory } from 'react-router-dom';

function PanelPrincipal() {
  const [microservices, setMicroservices] = useState([]);
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = localStorage.getItem("lightTheme");
    return saved === "true";
  });
  const [user, setUser] = useState(null);
  const history = useHistory();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/microservices') // Cambia esta URL según tu backend
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
    <div className={`app-container ${lightTheme ? 'light-theme' : 'dark-theme'}`}>
      <nav className="navbar">
        <h1>Microservicios</h1>
        <button onClick={() => setLightTheme(prev => !prev)}>
          {lightTheme ? '🌙' : '☀️'}
        </button>
        {user && (
          <div className="user-panel">
            <span>{user.username}</span>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </nav>
      <aside className="side-menu">
        {/* Aquí puedes agregar los enlaces a otras secciones de la aplicación */}
      </aside>
      <main className="main-content">
        <h2>Lista de Microservicios</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {microservices.map(microservice => (
              <tr key={microservice.id}>
                <td>{microservice.id}</td>
                <td>{microservice.name}</td>
                <td>{microservice.type}</td>
                <td>
                  <button onClick={() => {/* Lógica para editar */}}>Editar</button>
                  <button onClick={() => {/* Lógica para eliminar */}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default PanelPrincipal;