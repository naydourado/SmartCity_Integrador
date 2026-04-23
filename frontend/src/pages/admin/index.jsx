import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { getUser, isAdmin } from "../../utils/auth";
import { formatDateTime } from "../../utils/format";
import "../../components/ui.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sensores, setSensores] = useState([]);
  const [historicos, setHistoricos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const admin = isAdmin(user);

  useEffect(() => {
    async function load() {
      try {
        const [sensoresRes, historicosRes, ambientesRes] = await Promise.all([
          api.get("/sensores/"),
          api.get("/historicos-recentes/"),
          api.get("/ambientes/"),
        ]);
        setSensores(Array.isArray(sensoresRes.data) ? sensoresRes.data : sensoresRes.data.results || []);
        setHistoricos(Array.isArray(historicosRes.data) ? historicosRes.data : historicosRes.data.results || []);
        setAmbientes(Array.isArray(ambientesRes.data) ? ambientesRes.data : ambientesRes.data.results || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sensoresAtivos = useMemo(() => sensores.filter((item) => item.status).length, [sensores]);
  const tipos = ["temperatura", "umidade", "luminosidade", "contador"];

  return (
    <AppShell
      title="Dashboard"
      subtitle={admin ? "Visão geral administrativa do sistema." : "Visão geral de consulta do sistema."}
    >
      <section className="page-grid">
        <div className="grid-cards">
          <div className="card"><h3>Total de sensores</h3><p className="kpi-value">{loading ? "..." : sensores.length}</p></div>
          <div className="card"><h3>Sensores ativos</h3><p className="kpi-value">{loading ? "..." : sensoresAtivos}</p></div>
          <div className="card"><h3>Ambientes</h3><p className="kpi-value">{loading ? "..." : ambientes.length}</p></div>
          <div className="card"><h3>Medições recentes</h3><p className="kpi-value">{loading ? "..." : historicos.length}</p></div>
        </div>

        <div className="grid-cards">
          {tipos.map((tipo) => (
            <button key={tipo} className="card btn-secondary" onClick={() => navigate(`/sensores/${tipo}`)}>
              <h3>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
              <p>Ir para a listagem específica.</p>
            </button>
          ))}
        </div>

        <div className="card">
          <h3>Últimas medições</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Valor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historicos.slice(0, 8).map((item) => (
                  <tr key={item.id || `${item.sensor}-${item.timestamp}`}>
                    <td>{item.sensor_nome || item.sensor || "-"}</td>
                    <td>{item.valor ?? "-"}</td>
                    <td>{formatDateTime(item.timestamp)}</td>
                  </tr>
                ))}
                {!historicos.length && !loading && (
                  <tr><td colSpan="3">Nenhuma medição encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
