
import React from 'react';
import './App.css';

function Informacion() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-logo">🍁 Oak Services</div>
        <div className="navbar-links">
          {/* Puedes agregar aquí enlaces o botones si tu navbar los tiene */}
        </div>
      </nav>
      <div className="info-page" style={{ padding: 32, maxWidth: 900, margin: '0 auto', fontSize: 17 }}>
        {/* ...contenido de la info-page (README en JSX)... */}
        <h1 style={{ marginBottom: 10 }}>🍁 Oak Services</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
          <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
          <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
          <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
          <img src="https://img.shields.io/badge/Roble-000000?style=for-the-badge&logoColor=white" alt="Roble" />
        </div>
        <hr />
        {/* ...el resto del contenido del README en JSX... */}
        {/* ...existing code... */}
      </div>
      <footer className="footer" style={{ marginTop: 40, padding: 16, background: '#f3f3f3', textAlign: 'center', color: '#555' }}>
        © {new Date().getFullYear()} Oak Services — Todos los derechos reservados
      </footer>
    </div>
  );
}

export default Informacion;