import React, { useEffect, useState } from 'react';
import './PanelPrincipal.css'; // Asegúrate de tener estilos para la tabla y el layout
import { useHistory } from 'react-router-dom';

function PanelPrincipal() {
  const [microservices, setMicroservices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchMicroservices = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/microservices'); // Cambia la URL según tu backend
        if (!response.ok) {
          throw new Error('Error al obtener los microservicios');
        }
        const data = await response.json();
        setMicroservices(data.microservices || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMicroservices();
  }, []);

  const handleEdit = (id) => {
    history.push(`/edit/${id}`); // Redirige a la página de edición del microservicio
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este microservicio?')) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/microservices/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar el microservicio');
        }
        setMicroservices(microservices.filter(ms => ms.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="panel-principal">
      <nav className="navbar">
        <h1>Microservicios</h1>
        {/* Aquí puedes incluir el botón para el modo oscuro y el panel de usuario */}
      </nav>
      <aside className="side-menu">
        {/* Aquí puedes incluir el contenido del sidebar */}
      </aside>
      <main className="main-content">
        {loading ? (
          <p>Cargando microservicios...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
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
              {microservices.map(ms => (
                <tr key={ms.id}>
                  <td>{ms.id}</td>
                  <td>{ms.name}</td>
                  <td>{ms.type}</td>
                  <td>
                    <button onClick={() => handleEdit(ms.id)}>Editar</button>
                    <button onClick={() => handleDelete(ms.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default PanelPrincipal;