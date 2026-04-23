import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { formatDateTime } from "../../utils/format";
import "../../components/ui.css";

export default function HistoricosRecentes() {
  const [historicos, setHistoricos] = useState([]);

  useEffect(() => {
    async function load() {
      const response = await api.get("/historicos-recentes/");
      setHistoricos(Array.isArray(response.data) ? response.data : response.data.results || []);
    }
    load();
  }, []);

  return (
    <AppShell title="Históricos recentes" subtitle="Endpoint específico das últimas 24 horas.">
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Valor</th>
                <th>Data e hora</th>
              </tr>
            </thead>
            <tbody>
              {historicos.map((item) => (
                <tr key={item.id || `${item.sensor}-${item.timestamp}`}>
                  <td>{item.sensor_nome || item.sensor || "-"}</td>
                  <td>{item.valor ?? "-"}</td>
                  <td>{formatDateTime(item.timestamp)}</td>
                </tr>
              ))}
              {!historicos.length && <tr><td colSpan="3">Nenhuma medição recente encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
