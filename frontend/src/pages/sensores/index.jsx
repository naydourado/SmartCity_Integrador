import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { getUser, isAdmin } from "../../utils/auth";
import { formatBool, titleCase } from "../../utils/format";
import "../../components/ui.css";

const unitMap = {
  temperatura: "C",
  umidade: "%",
  luminosidade: "lux",
  contador: "uni",
};

const defaultForm = {
  sensor: "temperatura",
  unidade_med: "C",
  mic: "",
  status: true,
};

export default function Sensores() {
  const [sensores, setSensores] = useState([]);
  const [microcontroladores, setMicrocontroladores] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    tipo: "",
    status: "",
  });
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const admin = isAdmin(getUser());

  async function loadData() {
    try {
      const [sensoresRes, microsRes] = await Promise.all([
        api.get("/sensores/"),
        api.get("/microcontroladores/"),
      ]);

      setSensores(
        Array.isArray(sensoresRes.data)
          ? sensoresRes.data
          : sensoresRes.data.results || []
      );

      setMicrocontroladores(
        Array.isArray(microsRes.data)
          ? microsRes.data
          : microsRes.data.results || []
      );
    } catch {
      setError("Não foi possível carregar os sensores.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      unidade_med: unitMap[prev.sensor] || "C",
    }));
  }, [form.sensor]);

  const filtered = useMemo(() => {
    return sensores.filter((item) => {
      const byTipo = filters.tipo ? item.sensor === filters.tipo : true;
      const byStatus =
        filters.status === "" ? true : String(item.status) === filters.status;

      const micTexto =
        item.mic_nome ||
        item.mic_detalhe ||
        item.mic ||
        item.microcontrolador_nome ||
        "";

      const target = `${item.sensor || ""} ${micTexto}`.toLowerCase();
      const bySearch = filters.search
        ? target.includes(filters.search.toLowerCase())
        : true;

      return byTipo && byStatus && bySearch;
    });
  }, [sensores, filters]);

  function startEdit(item) {
    setEditingId(item.id || item.idSensor || item.pk);
    setForm({
      sensor: item.sensor || "temperatura",
      unidade_med: item.unidade_med || unitMap[item.sensor] || "C",
      mic: item.mic || item.mic_id || "",
      status: Boolean(item.status),
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(defaultForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      sensor: String(form.sensor).trim().toLowerCase(),
      unidade_med: String(form.unidade_med).trim(),
      mic: Number(form.mic),
      status: form.status,
    };

    try {
      if (editingId) {
        await api.put(`/sensores/${editingId}/`, payload);
        setMessage("Sensor atualizado com sucesso.");
      } else {
        await api.post("/sensores/", payload);
        setMessage("Sensor cadastrado com sucesso.");
      }

      resetForm();
      loadData();
    } catch (err) {
      console.error("ERRO SENSOR:", err.response?.data || err);
      setError("Não foi possível salvar o sensor.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este sensor?")) return;

    try {
      await api.delete(`/sensores/${id}/`);
      setMessage("Sensor excluído com sucesso.");
      loadData();
    } catch (err) {
      console.error(err);
      setError("Não foi possível excluir o sensor.");
    }
  }

  return (
    <AppShell
      title="Sensores"
      subtitle="Listagem em tabela com filtros e CRUD."
    >
      <section className="page-grid">
        <div className="card">
          <div className="toolbar">
            <input
              className="input"
              placeholder="Buscar por tipo ou microcontrolador"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />

            <select
              className="select"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            >
              <option value="">Todos os tipos</option>
              <option value="temperatura">Temperatura</option>
              <option value="umidade">Umidade</option>
              <option value="luminosidade">Luminosidade</option>
              <option value="contador">Contador</option>
            </select>

            <select
              className="select"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">Todos os status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        {admin && (
          <form className="card form-grid" onSubmit={handleSubmit}>
            <h3 className="full">
              {editingId ? "Editar sensor" : "Cadastrar sensor"}
            </h3>

            <label>
              Tipo
              <select
                className="select"
                value={form.sensor}
                onChange={(e) =>
                  setForm({ ...form, sensor: e.target.value })
                }
              >
                <option value="temperatura">Temperatura</option>
                <option value="umidade">Umidade</option>
                <option value="luminosidade">Luminosidade</option>
                <option value="contador">Contador</option>
              </select>
            </label>

            <label>
              Unidade
              <input className="input" value={form.unidade_med} readOnly />
            </label>

            <label>
              Microcontrolador
              <select
                className="select"
                value={form.mic}
                onChange={(e) =>
                  setForm({ ...form, mic: e.target.value })
                }
                required
              >
                <option value="">Selecione</option>
                {microcontroladores.map((item) => {
                  const id = item.id || item.idMicro || item.idMicrocontrolador;
                  return (
                    <option key={id} value={id}>
                      {item.modelo} - {item.mac_address}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Status
              <select
                className="select"
                value={String(form.status)}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value === "true" })
                }
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>

            <div className="actions full">
              <button className="btn" type="submit">
                {editingId ? "Salvar alterações" : "Cadastrar"}
              </button>

              {editingId && (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}
            </div>

            {message && <div className="message full">{message}</div>}
            {error && <div className="message error full">{error}</div>}
          </form>
        )}

        <div className="card">
          <h3>Listagem de sensores</h3>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Unidade</th>
                  <th>Microcontrolador</th>
                  <th>Status</th>
                  {admin && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const id = item.id || item.idSensor || item.pk;

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{titleCase(item.sensor)}</td>
                      <td>{item.unidade_med || "-"}</td>
                      <td>
                        {item.mic_nome ||
                          item.mic_detalhe ||
                          item.mic ||
                          item.microcontrolador_nome ||
                          "-"}
                      </td>
                      <td>
                        <span className={item.status ? "badge" : "badge off"}>
                          {formatBool(item.status)}
                        </span>
                      </td>

                      {admin && (
                        <td>
                          <div className="actions">
                            <button
                              className="btn-secondary"
                              type="button"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-danger"
                              type="button"
                              onClick={() => handleDelete(id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {!filtered.length && (
                  <tr>
                    <td colSpan={admin ? 6 : 5}>Nenhum sensor encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}