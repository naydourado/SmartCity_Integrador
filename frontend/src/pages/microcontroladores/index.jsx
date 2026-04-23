import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { getUser, isAdmin } from "../../utils/auth";
import { formatBool } from "../../utils/format";
import "../../components/ui.css";

const initialForm = {
  modelo: "",
  mac_address: "",
  latitude: "",
  longitude: "",
  status: true,
  ambiente: "",
};

export default function Microcontroladores() {
  const admin = isAdmin(getUser());
  const [items, setItems] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  async function loadData() {
    const [microRes, ambientesRes] = await Promise.all([
      api.get("/microcontroladores/"),
      api.get("/ambientes/"),
    ]);
    setItems(Array.isArray(microRes.data) ? microRes.data : microRes.data.results || []);
    setAmbientes(Array.isArray(ambientesRes.data) ? ambientesRes.data : ambientesRes.data.results || []);
  }

  useEffect(() => { loadData(); }, []);

  function edit(item) {
    setEditingId(item.id || item.idMicrocontrolador);
    setForm({
      modelo: item.modelo || "",
      mac_address: item.mac_address || "",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
      status: Boolean(item.status),
      ambiente: item.ambiente || item.ambiente_id || "",
    });
  }

  async function save(event) {
    event.preventDefault();
    const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
    if (editingId) {
      await api.put(`/microcontroladores/${editingId}/`, payload);
    } else {
      await api.post("/microcontroladores/", payload);
    }
    setEditingId(null);
    setForm(initialForm);
    loadData();
  }

  async function remove(id) {
    if (!window.confirm("Deseja excluir este microcontrolador?")) return;
    await api.delete(`/microcontroladores/${id}/`);
    loadData();
  }

  return (
    <AppShell title="Microcontroladores" subtitle="Cadastro e listagem em tabela.">
      <section className="page-grid">
        {admin && (
          <form className="card form-grid" onSubmit={save}>
            <h3 className="full">{editingId ? "Editar microcontrolador" : "Cadastrar microcontrolador"}</h3>
            <label>Modelo<input className="input" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} required /></label>
            <label>MAC address<input className="input" value={form.mac_address} onChange={(e) => setForm({ ...form, mac_address: e.target.value })} required /></label>
            <label>Latitude<input className="input" type="number" step="0.000001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required /></label>
            <label>Longitude<input className="input" type="number" step="0.000001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required /></label>
            <label>Ambiente
              <select className="select" value={form.ambiente} onChange={(e) => setForm({ ...form, ambiente: e.target.value })}>
                <option value="">Selecione</option>
                {ambientes.map((item) => <option key={item.id || item.idAmbiente} value={item.id || item.idAmbiente}>{item.descricao || item.nome}</option>)}
              </select>
            </label>
            <label>Status
              <select className="select" value={String(form.status)} onChange={(e) => setForm({ ...form, status: e.target.value === "true" })}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>
            <div className="actions full">
              <button className="btn" type="submit">{editingId ? "Salvar alterações" : "Cadastrar"}</button>
              {editingId && <button className="btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancelar</button>}
            </div>
          </form>
        )}

        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Modelo</th>
                  <th>MAC</th>
                  <th>Lat/Lng</th>
                  <th>Status</th>
                  {admin && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const id = item.id || item.idMicrocontrolador;
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{item.modelo || "-"}</td>
                      <td>{item.mac_address || "-"}</td>
                      <td>{item.latitude}, {item.longitude}</td>
                      <td><span className={item.status ? "badge" : "badge off"}>{formatBool(item.status)}</span></td>
                      {admin && (
                        <td>
                          <div className="actions">
                            <button className="btn-secondary" onClick={() => edit(item)}>Editar</button>
                            <button className="btn-danger" onClick={() => remove(id)}>Excluir</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
