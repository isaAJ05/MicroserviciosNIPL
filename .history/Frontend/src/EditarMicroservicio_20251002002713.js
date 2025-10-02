import React, { useState, useEffect } from "react";

function EditarMicroservicio({ id, onBack }) {
  const [microservice, setMicroservice] = useState(null);
  const [form, setForm] = useState({
    name: "",
    processing_type: "",
    endpoint: "",
    code: ""
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/microservices`)
      .then(res => res.json())
      .then(data => {
        const ms = (data.microservices || []).find(m => m.id === id);
        if (ms) {
          setMicroservice(ms);
          setForm({
            name: ms.name,
            processing_type: ms.processing_type,
            endpoint: ms.endpoint,
            code: ms.code
          });
        }
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch(`http://127.0.0.1:5000/microservices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    onBack();
  };

  if (!microservice) return <div>Cargando...</div>;

  return (
    <div className="modal-bg">
      <div className="modal">
        <h3>Editar Microservicio</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />
          <input
            type="text"
            name="processing_type"
            value={form.processing_type}
            onChange={handleChange}
            placeholder="Tipo de procesamiento"
            required
          />
          <input
            type="text"
            name="endpoint"
            value={form.endpoint}
            onChange={handleChange}
            placeholder="Endpoint"
            required
          />
          <textarea
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Código Python"
            rows={5}
            required
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="action-btn">Guardar</button>
            <button type="button" className="action-btn" style={{ background: '#23263a' }} onClick={onBack}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarMicroservicio;