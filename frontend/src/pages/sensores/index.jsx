import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

export default function Sensores() {
  const navigate = useNavigate();

  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

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

        setSensores(response.data);
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
  }, [navigate]);

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const formatarTexto = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const sensoresFiltrados = sensores.filter((sensor) => {
    if (!filtro) return true;

    return (
      sensor.sensor.toLowerCase().includes(filtro.toLowerCase()) ||
      String(sensor.idSensor).includes(filtro) ||
      String(sensor.mic).includes(filtro)
    );
  });

  const totalSensores = sensores.length;
  const sensoresAtivos = sensores.filter((sensor) => sensor.status).length;
  const sensoresInativos = sensores.filter((sensor) => !sensor.status).length;

  const contarPorTipo = (tipo) => {
    return sensores.filter((sensor) => sensor.sensor === tipo).length;
  };

  const abrirTipo = (tipo) => {
    navigate(`/sensores/${tipo}`);
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

            <button className="menuItem active">
              Sensores
            </button>

            <button className="menuItem" onClick={() => navigate("/historicos")}>
              Históricos
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
            <h1>Sensores</h1>
            <p>Visualize os sensores cadastrados e acesse cada categoria.</p>
          </div>
        </header>

        <section className="topInfo">
          <div className="infoBox">
            <span>Total de sensores</span>
            <strong>{totalSensores}</strong>
          </div>

          <div className="infoBox">
            <span>Sensores ativos</span>
            <strong>{sensoresAtivos}</strong>
          </div>

          <div className="infoBox">
            <span>Sensores inativos</span>
            <strong>{sensoresInativos}</strong>
          </div>
        </section>

        <section className="categoriasSection">
          <div className="sectionHeader">
            <h2>Categorias de sensores</h2>
            <p>Clique em uma categoria para ver os sensores daquele tipo.</p>
          </div>

          <div className="cardsGrid">
            <div className="sensorCard" onClick={() => abrirTipo("temperatura")}>
              <div className="sensorIcon">🌡️</div>
              <h3>Temperatura</h3>
              <p>{contarPorTipo("temperatura")} sensores cadastrados</p>
              <span>Ver categoria</span>
            </div>

            <div className="sensorCard" onClick={() => abrirTipo("umidade")}>
              <div className="sensorIcon">💧</div>
              <h3>Umidade</h3>
              <p>{contarPorTipo("umidade")} sensores cadastrados</p>
              <span>Ver categoria</span>
            </div>

            <div className="sensorCard" onClick={() => abrirTipo("luminosidade")}>
              <div className="sensorIcon">💡</div>
              <h3>Luminosidade</h3>
              <p>{contarPorTipo("luminosidade")} sensores cadastrados</p>
              <span>Ver categoria</span>
            </div>

            <div className="sensorCard" onClick={() => abrirTipo("contador")}>
              <div className="sensorIcon">🔢</div>
              <h3>Contador</h3>
              <p>{contarPorTipo("contador")} sensores cadastrados</p>
              <span>Ver categoria</span>
            </div>
          </div>
        </section>

        <section className="tableCard">
          <div className="tableHeader">
            <h2>Lista geral de sensores</h2>

            <input
              className="searchInput"
              type="text"
              placeholder="Buscar por tipo, id ou microcontrolador"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="loadingText">Carregando sensores...</p>
          ) : sensoresFiltrados.length === 0 ? (
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
                {sensoresFiltrados.map((sensor) => (
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