import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../sensores/styles.css";

export default function SensoresTipo() {
  const navigate = useNavigate();
  const { tipo } = useParams();

  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function carregarSensores() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/sensores/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filtrados = response.data.filter((sensor) => {
        return sensor.sensor
            ?.toString()
            .trim()
            .toLowerCase() === tipo.toString().trim().toLowerCase();
        });

        setSensores(filtrados);
      } catch (error) {
        console.log("Erro ao buscar sensores:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    carregarSensores();
  }, [tipo, navigate]);

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const formatarTexto = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  return (
    <div className="sensoresPage">
      <aside className="sensoresSidebar">
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
              {formatarTexto(tipo)}
            </button>
          </nav>
        </div>

        <button className="logoutButton" onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="sensoresContent">
        <header className="contentHeader">
          <div>
            <h1>Categoria: {formatarTexto(tipo)}</h1>
            <p>Lista de sensores dessa categoria.</p>
          </div>
        </header>

        <section className="tableCard">
          {loading ? (
            <p className="loadingText">Carregando sensores...</p>
          ) : sensores.length === 0 ? (
            <p className="emptyText">Nenhum sensor encontrado.</p>
          ) : (
            <table className="sensoresTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Unidade</th>
                  <th>Microcontrolador</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sensores.map((sensor) => (
                  <tr key={sensor.idSensor}>
                    <td>{sensor.idSensor}</td>
                    <td>{formatarTexto(sensor.sensor)}</td>
                    <td>{sensor.unidade_med}</td>
                    <td>{sensor.mic}</td>
                    <td>
                      <span className={sensor.status ? "badge ativo" : "badge inativo"}>
                        {sensor.status ? "ativo" : "inativo"}
                      </span>
                    </td>
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