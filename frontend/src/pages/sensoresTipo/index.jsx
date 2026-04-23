import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import api from "../../services/api";
import { formatBool, titleCase } from "../../utils/format";
import "../../components/ui.css";

export default function SensoresTipo() {
  const { tipo } = useParams();
  const [sensores, setSensores] = useState([]);

  useEffect(() => {
    async function load() {
      const response = await api.get("/sensores/");
      setSensores(Array.isArray(response.data) ? response.data : response.data.results || []);
    }
    load();
  }, []);

  const filtered = useMemo(() => sensores.filter((item) => item.sensor === tipo), [sensores, tipo]);

  return (
    <AppShell title={`Sensores de ${titleCase(tipo)}`} subtitle="Página específica por tipo, como pedido no enunciado.">
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>MAC</th>
                <th>Unidade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id || item.idSensor || item.pk}>
                  <td>{item.id || item.idSensor || item.pk}</td>
                  <td>{item.mac_address || item.identificacao || "-"}</td>
                  <td>{item.unidade_med || "-"}</td>
                  <td><span className={item.status ? "badge" : "badge off"}>{formatBool(item.status)}</span></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="4">Nenhum sensor desse tipo encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
