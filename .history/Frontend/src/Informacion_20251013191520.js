import React from 'react';
import './App.css';

function Informacion() {
  return (
    <div className="info-page" style={{ padding: 32, maxWidth: 900, margin: '0 auto', fontSize: 17 }}>
      <h1 style={{ marginBottom: 10 }}>🍁 Oak Services</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
        <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
        <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
        <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
        <img src="https://img.shields.io/badge/Roble-000000?style=for-the-badge&logoColor=white" alt="Roble" />
      </div>
      <hr />
      <h2>🪵 Descripción general</h2>
      <p><b>Oak Services</b> es una plataforma web que permite a los usuarios <b>crear, editar, eliminar y listar microservicios</b> de manera segura y aislada, con <b>autenticación Roble</b>, gestión de usuarios y <b>despliegue automático en contenedores Docker</b>.</p>
      <ul>
        <li><b>Frontend en React</b></li>
        <li><b>Backend en Flask</b></li>
        <li><b>Orquestación con Docker Compose</b></li>
      </ul>
      <p>
        Cada usuario puede administrar <b>únicamente sus propios microservicios</b>, los cuales se ejecutan en contenedores Docker independientes y validados automáticamente con Roble.
      </p>
      <hr />
      <h2>👩‍💻 Integrantes</h2>
      <ul>
        <li>Natalia Carpintero</li>
        <li>Isabella Arrieta</li>
        <li>Paula Núñez</li>
        <li>Luis Robles</li>
      </ul>
      <hr />
      <h2>⚙️ Instrucciones de uso</h2>
      <h3>🧱 Requisitos previos</h3>
      <ul>
        <li>Tener <b>Docker</b> y <b>Docker Compose</b> instalados.</li>
        <li>Contar con un archivo <code>.env</code> válido en la carpeta <code>Backend</code> (requerido para el acceso como invitado).</li>
      </ul>
      <h3>🚀 Configuración rápida</h3>
      <pre style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 8, fontSize: 15, overflowX: 'auto' }}>
{`# 1️⃣ Clonar el repositorio
git clone <url-repositorio>
cd MicroserviciosNIPL

# 2️⃣ Construir y ejecutar contenedores
docker compose up --build`}
      </pre>
      <p>Accede a:</p>
      <ul>
        <li>Frontend: <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">http://localhost:3000</a></li>
        <li>Backend: <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer">http://localhost:5000</a></li>
      </ul>
      <hr />
      <h3>🌐 Uso general de la plataforma</h3>
      {/* ...continúa con el resto del contenido del README en formato JSX... */}
      <div style={{ marginTop: 32, fontSize: 15, color: '#888' }}>oakservicesglobal@gmail.com</div>
    </div>
  );
}

export default Informacion;