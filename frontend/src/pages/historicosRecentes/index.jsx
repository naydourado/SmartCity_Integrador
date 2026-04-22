import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../historicos/styles.css";

export default function HistoricosRecentes() {
  const navigate = useNavigate();

  const [historicos, setHistoricos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function carregarHistoricos() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/historicos-recentes/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistoricos(response.data);
      } catch (error) {
        console.log("Erro ao buscar históricos recentes:", error);

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

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            <button className="menuItem active">Históricos recentes</button>
          </nav>
        </div>

        <button className="logoutButton" onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="historicosContent">
        <header className="contentHeader">
          <div>
            <h1>Históricos recentes</h1>
            <p>Medições registradas nas últimas 24 horas.</p>
          </div>
        </header>

        <section className="topInfo">
          <div className="infoBox">
            <span>Total nas últimas 24h</span>
            <strong>{historicos.length}</strong>
          </div>
        </section>

        <section className="tableCard">
          {loading ? (
            <p className="loadingText">Carregando históricos recentes...</p>
          ) : historicos.length === 0 ? (
            <p className="emptyText">Nenhum histórico recente encontrado.</p>
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
                {historicos.map((historico) => (
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