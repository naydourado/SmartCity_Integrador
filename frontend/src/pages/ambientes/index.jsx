import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { getUser, isAdmin } from "../../utils/auth";
import "../../components/ui.css";

const initialForm = { local: "", descricao: "", responsavel: "" };

export default function Ambientes() {
  const admin = isAdmin(getUser());
  const [ambientes, setAmbientes] = useState([]);
  const [locais, setLocais] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  async function loadData() {
    const [ambientesRes, locaisRes, responsaveisRes] = await Promise.all([
      api.get("/ambientes/"),
      api.get("/locais/"),
      api.get("/responsaveis/"),
    ]);
    setAmbientes(Array.isArray(ambientesRes.data) ? ambientesRes.data : ambientesRes.data.results || []);
    setLocais(Array.isArray(locaisRes.data) ? locaisRes.data : locaisRes.data.results || []);
    setResponsaveis(Array.isArray(responsaveisRes.data) ? responsaveisRes.data : responsaveisRes.data.results || []);
  }

  useEffect(() => { loadData(); }, []);

  function edit(item) {
    setEditingId(item.id || item.idAmbiente);
    setForm({
      local: item.local || item.local_id || "",
      descricao: item.descricao || "",
      responsavel: item.responsavel || item.responsavel_id || "",
    });
  }

  async function save(event) {
    event.preventDefault();
    if (editingId) {
      await api.put(`/ambientes/${editingId}/`, form);
    } else {
      await api.post("/ambientes/", form);
    }
    setForm(initialForm);
    setEditingId(null);
    loadData();
  }

  async function remove(id) {
    if (!window.confirm("Deseja excluir este ambiente?")) return;
    await api.delete(`/ambientes/${id}/`);
    loadData();
  }

  return (
    <AppShell title="Ambientes" subtitle="CRUD completo para administrador e visualização para usuário.">
      <section className="page-grid">
        {admin && (
          <form className="card form-grid" onSubmit={save}>
            <h3 className="full">{editingId ? "Editar ambiente" : "Cadastrar ambiente"}</h3>
            <label>Local
              <select className="select" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} required>
                <option value="">Selecione</option>
                {locais.map((item) => <option key={item.id || item.idLocal} value={item.id || item.idLocal}>{item.local || item.nome}</option>)}
              </select>
            </label>
            <label>Responsável
              <select className="select" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} required>
                <option value="">Selecione</option>
                {responsaveis.map((item) => <option key={item.id || item.idResponsavel} value={item.id || item.idResponsavel}>{item.nome}</option>)}
              </select>
            </label>
            <label className="full">Descrição<input className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required /></label>
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
                  <th>Local</th>
                  <th>Descrição</th>
                  <th>Responsável</th>
                  {admin && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {ambientes.map((item) => {
                  const id = item.id || item.idAmbiente;
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{item.local_nome || item.local || "-"}</td>
                      <td>{item.descricao || "-"}</td>
                      <td>{item.responsavel_nome || item.responsavel || "-"}</td>
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
