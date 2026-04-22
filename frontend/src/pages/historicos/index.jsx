import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

export default function Historicos() {
  const navigate = useNavigate();

  const [historicos, setHistoricos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function carregarHistoricos() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/historicos/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistoricos(response.data);
      } catch (error) {
        console.log("Erro ao buscar históricos:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    carregarHistoricos();
  }, [navigate]);

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const formatarData = (data) => {
    if (!data) return "-";

    const novaData = new Date(data);

    return novaData.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const historicosFiltrados = historicos.filter((historico) => {
    if (!filtro) return true;

    return (
      String(historico.idHistorico).includes(filtro) ||
      String(historico.sensor).includes(filtro) ||
      String(historico.valor).includes(filtro) ||
      String(historico.timestamp).toLowerCase().includes(filtro.toLowerCase())
    );
  });

  return (
    <div className="historicosPage">
      <aside className="historicosSidebar">
        <div>
          <div className="brandTop">
            <div className="brandIcon">S</div>
            <div>
              <h2>Smart City TecnoVille</h2>
              <p>Projeto Integrador · SENAI</p>
            </div>
          </div>

          <nav className="sidebarMenu">
            <button className="menuItem" onClick={() => navigate("/admin/home")}>
              Home
            </button>

            <button className="menuItem" onClick={() => navigate("/sensores")}>
              Sensores
            </button>

            <button className="menuItem active">
              Históricos
            </button>
          </nav>
        </div>

        <button className="logoutButton" onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="historicosContent">
        <header className="contentHeader">
          <div>
            <h1>Históricos</h1>
            <p>Visualize todas as medições registradas no sistema.</p>
          </div>
        </header>

        <section className="topInfo">
          <div className="infoBox">
            <span>Total de medições</span>
            <strong>{historicos.length}</strong>
          </div>

          <div className="infoBox">
            <span>Últimas 24h</span>
            <strong>
              {
                historicos.filter((item) => {
                  const agora = new Date();
                  const dataItem = new Date(item.timestamp);
                  const diff = agora - dataItem;
                  return diff <= 24 * 60 * 60 * 1000;
                }).length
              }
            </strong>
          </div>
        </section>

        <section className="tableCard">
          <div className="tableHeader">
            <h2>Lista de medições</h2>

            <input
              className="searchInput"
              type="text"
              placeholder="Buscar por id, sensor, valor ou data"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="loadingText">Carregando históricos...</p>
          ) : historicosFiltrados.length === 0 ? (
            <p className="emptyText">Nenhum histórico encontrado.</p>
          ) : (
            <table className="historicosTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sensor</th>
                  <th>Valor</th>
                  <th>Data e hora</th>
                </tr>
              </thead>
              <tbody>
                {historicosFiltrados.map((historico) => (
                  <tr key={historico.idHistorico}>
                    <td>{historico.idHistorico}</td>
                    <td>{historico.sensor}</td>
                    <td>{historico.valor}</td>
                    <td>{formatarData(historico.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}