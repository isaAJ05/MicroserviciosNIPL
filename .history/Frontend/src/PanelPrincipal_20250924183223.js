import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function PanelPrincipal() {
  const [microservices, setMicroservices] = useState([]);
  const [lightTheme, setLightTheme] = useState(() => {
    const saved = localStorage.getItem("lightTheme");
    return saved === "true";
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [userPanelFade, setUserPanelFade] = useState(false);
  const [user, setUser] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  return (
    <div className={`app-container${isHistoryOpen ? ' history-open' : ''}${lightTheme ? ' light-theme' : ''}`}>
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
              animationName: userPanelFade ? "fadeOutMsg" : "fadeInMsg",
              animationDuration: "0.35s",
              animationFillMode: "forwards"
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
              {user?.username || 'Invitado'}
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
                setUser(null);
                localStorage.removeItem("user");
                window.location.reload();
              }}
            >
              Cerrar sesión
            </button>
          </div>
              )}
     {/* Lista de bases de datos y tablas */}
          {isDbListOpen && (
          <div style={{ marginLeft: 16, borderLeft: "2px solid #333", paddingLeft: 8 }}>
            {databases.length === 0 ? (
              <p style={{ fontSize: "0.95em" }}>No hay bases de datos.</p>
            ) : (
              databases.map((db) => (
                <div key={db}>
                  <button
                    className="history-btn"
                    style={{
                      fontWeight: expandedDb === db ? "bold" : "normal",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                    onClick={() => setExpandedDb(expandedDb === db ? null : db)}
                    title={`Ver tablas de ${db}`}
                  >
                    <span style={{ fontSize: 16 }}>
                      {expandedDb === db ? "📂" : "📁"}
                    </span>
                    {db}
                  </button>
                  {expandedDb === db && (
                  <div style={{ marginLeft: 16, borderLeft: "2px solid #333", paddingLeft: 8 }}>
                    {loadingTables[db] ? (
                      <p style={{ fontSize: "0.9em" }}>Cargando tablas...</p>
                    ) : tablesByDb[db] && tablesByDb[db].length > 0 ? (
                          tablesByDb[db].map((table) => (
                            <div key={table}>
                              <button
                                className="history-btn"
                                style={{
                                  fontSize: "0.95em",
                                  margin: "3px 0",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6
                                }}
                                title={`Ver columnas de ${table}`}
                                onClick={() => handleShowColumns(db, table)}
                              >
                                <span style={{ fontSize: 15 }}>🗒️</span>
                                {table}
                              </button>
                              {/* Mostrar columnas si esta tabla está seleccionada */}
                              {selectedTable === table && selectedDb === db && selectedTableColumns.length > 0 && (
                                <ul style={{ margin: "4px 0 4px 24px", padding: 0, color: "#bfc7d5", fontSize: "0.97em" }}>
                                  {selectedTableColumns.map(col => (
                                    <li key={col.name} style={{ listStyle: "disc", marginLeft: 12, position: 'relative' }}>
                                      <span
                                        className="sidebar-col-tooltip custom-tooltip-trigger"
                                        tabIndex={0}
                                        onMouseMove={e => {
                                          setColTooltip({
                                            visible: true,
                                            x: e.clientX + 14,
                                            y: e.clientY + 8,
                                            text: col.type
                                          });
                                        }}
                                        onMouseLeave={() => setColTooltip(t => ({ ...t, visible: false }))}
                                        onFocus={e => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setColTooltip({
                                            visible: true,
                                            x: rect.right + 14,
                                            y: rect.top + rect.height / 2,
                                            text: col.type
                                          });
                                        }}
                                        onBlur={() => setColTooltip(t => ({ ...t, visible: false }))}
                                      >
                                        {col.name}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: "0.9em" }}>No hay tablas.</p>
                        )}
                  </div>
                )}


                </div>
              ))
            )}
          </div>
        )}

        </aside>

      </nav>

      <aside className={`side-menu${isHistoryOpen ? " open" : ""}`}>
        {/* Puedes agregar aquí enlaces o menú lateral si lo necesitas */}
      </aside>

      <div className="panel-content">
        <h2>Lista de Microservicios</h2>
        <table className="microservices-table">
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
                <td>{microservice.processing_type}</td>
                <td>{microservice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PanelPrincipal;