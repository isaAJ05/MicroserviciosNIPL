import React from 'react';
import './App.css';

function Informacion() {
  return (
    <div className="info-page" style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 18 }}>Información del Proyecto</h2>
      <p>
        Bienvenido a <b>Oak Services</b>. Aquí puedes gestionar y monitorear tus microservicios fácilmente.
      </p>
      <h3>¿Qué puedes hacer aquí?</h3>
      <ul>
        <li>Agregar, editar y eliminar microservicios.</li>
        <li>Probar endpoints de cada microservicio.</li>
        <li>Ver el código fuente de cada microservicio.</li>
        <li>Ver el estado de Docker y la conexión.</li>
      </ul>
      <h3>Recursos útiles</h3>
      <ul>
        <li>
          <a href="https://github.com/isaAJ05/Oak-Services-NIPL" target="_blank" rel="noopener noreferrer">
            Repositorio en GitHub
          </a>
        </li>
        <li>
          <a href="https://github.com/isaAJ05/Oak-Services-NIPL/blob/main/README.md" target="_blank" rel="noopener noreferrer">
            Leer README completo
          </a>
        </li>
      </ul>
      <h3>Contacto</h3>
      <p>oakservicesglobal@gmail.com</p>
    </div>
  );
}

export default Informacion;
