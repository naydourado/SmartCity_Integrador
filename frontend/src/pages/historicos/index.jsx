import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { getUser, isAdmin } from "../../utils/auth";
import { formatDateTime } from "../../utils/format";
import "../../components/ui.css";

const initialForm = {
  sensor: "",
  valor: "",
  timestamp: "",
};

export default function Historicos() {
  const admin = isAdmin(getUser());
  const [historicos, setHistoricos] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [filters, setFilters] = useState({ sensor: "", data: "" });
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [historicosRes, sensoresRes] = await Promise.all([
        api.get("/historicos/"),
        api.get("/sensores/"),
      ]);

      setHistoricos(
        Array.isArray(historicosRes.data)
          ? historicosRes.data
          : historicosRes.data.results || []
      );

      setSensores(
        Array.isArray(sensoresRes.data)
          ? sensoresRes.data
          : sensoresRes.data.results || []
      );
    } catch {
      setError("Não foi possível carregar os históricos.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return historicos.filter((item) => {
      const bySensor = filters.sensor
        ? String(item.sensor) === filters.sensor ||
        String(item.sensor_id) === filters.sensor
        : true;

      const byDate = filters.data
        ? String(item.timestamp || "").slice(0, 10) === filters.data
        : true;

      return bySensor && byDate;
    });
  }, [historicos, filters]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      sensor: Number(form.sensor),
      valor: Number(form.valor),
      timestamp: form.timestamp ? `${form.timestamp}:00` : "",
    };

    try {
      await api.post("/historicos/", payload);
      setMessage("Medição cadastrada com sucesso.");
      setForm(initialForm);
      loadData();
    } catch (err) {
      console.error("ERRO HISTÓRICO:", err.response?.data || err);
      setError("Não foi possível cadastrar a medição.");
    }
  }

  return (
    <AppShell title="Históricos" subtitle="Listagem e entrada manual de medições.">
      <section className="page-grid">
        <div className="card toolbar">
          <select
            className="select"
            value={filters.sensor}
            onChange={(e) => setFilters({ ...filters, sensor: e.target.value })}
          >
            <option value="">Todos os sensores</option>
            {sensores.map((item) => {
              const id = item.id || item.idSensor;
              return (
                <option key={id} value={id}>
                  {item.sensor} - ID {id}
                </option>
              );
            })}
          </select>

          <input
            className="input"
            type="datetime-local"
            value={filters.data}
            onChange={(e) => setFilters({ ...filters, data: e.target.value })}
          />
        </div>

        {admin && (
          <form className="card form-grid" onSubmit={handleSubmit}>
            <h3 className="full">Entrada manual de medições</h3>

            <label>
              Sensor
              <select
                className="select"
                value={form.sensor}
                onChange={(e) => setForm({ ...form, sensor: e.target.value })}
                required
              >
                <option value="">Selecione</option>
                {sensores.map((item) => {
                  const id = item.id || item.idSensor;
                  return (
                    <option key={id} value={id}>
                      {item.sensor} - ID {id}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Valor
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                required
              />
            </label>

            <label>
              Timestamp
              <input
                className="input"
                type="datetime-local"
                value={form.timestamp}
                onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
                required
              />
            </label>

            <div className="actions full">
              <button className="btn" type="submit">
                Salvar medição
              </button>
            </div>

            {message && <div className="message full">{message}</div>}
            {error && <div className="message error full">{error}</div>}
          </form>
        )}

        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sensor</th>
                  <th>Valor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id || item.idHistorico || `${item.sensor}-${item.timestamp}`}>
                    <td>{item.id || item.idHistorico || "-"}</td>
                    <td>{item.sensor_nome || item.sensor || item.sensor_id || "-"}</td>
                    <td>{item.valor ?? "-"}</td>
                    <td>{formatDateTime(item.timestamp)}</td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td colSpan="4">Nenhum histórico encontrado.</td>
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