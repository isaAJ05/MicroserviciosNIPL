import React from 'react';
import './App.css';

docker compose up --build`}

function Informacion() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1c1c1c' }}>
      {/* NAVBAR */}
      <nav className="navbar">
        <img
          src="/red_logo_OSWIDTH.png"
          alt="Logo MicroServicios"
          style={{ height: 44, marginLeft: 10, marginRight: 14, borderRadius: 12 }}
        />
        <h1>Microservicios</h1>
      </nav>
      {/* CONTENIDO SCROLLABLE */}
      <div
        className="info-page"
        style={{
          padding: 32,
          maxWidth: 1200,
          margin: '0 auto',
          fontSize: 17,
          background: '#1c1c1c',
          flex: 1,
          overflowY: 'auto',
          minHeight: 0
        }}
      >
        {/* ...existing code... */}
        <h1 style={{ marginBottom: 10 }}>🍁 Oak Services</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
          <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
          <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
          <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
          <img src="https://img.shields.io/badge/Roble-000000?style=for-the-badge&logoColor=white" alt="Roble" />
        </div>
        {/* ...resto del contenido... */}
        {/* ...existing code... */}
      </div>
      {/* FOOTER */}
      <footer className="footer">
        <div>
          Oak Services &copy; 2025 &nbsp;&nbsp; <span style={{ fontWeight: 600 }}></span>
        </div>
        <div>
          <span>Contacto: oakservicesglobal@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}

export default Informacion;