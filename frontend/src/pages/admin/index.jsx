import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegUserCircle } from "react-icons/fa";
import "./styles.css";

export default function Home() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [historicos, setHistoricos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!token) {
      navigate("/login");
      return;
    }

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    async function carregarDados() {
      try {
        const [sensoresRes, historicosRes, ambientesRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/sensores/", { headers }),
          axios.get("http://127.0.0.1:8000/api/historicos-recentes/", { headers }),
          axios.get("http://127.0.0.1:8000/api/ambientes/", { headers }),
        ]);

        setSensores(sensoresRes.data);
        setHistoricos(historicosRes.data);
        setAmbientes(ambientesRes.data);
      } catch (error) {
        console.log("Erro ao carregar dados:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [navigate]);

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const abrirSensor = (tipo) => {
    navigate(`/sensores/${tipo}`);
  };

  const totalSensores = sensores.length;
  const sensoresAtivos = sensores.filter((sensor) => sensor.status === true).length;
  const medicoes24h = historicos.length;
  const totalAmbientes = ambientes.length;

  const porcentagemAtivos =
    totalSensores > 0 ? Math.round((sensoresAtivos / totalSensores) * 100) : 0;

  const contarPorTipo = (tipo) => {
    return sensores.filter((sensor) => sensor.sensor === tipo).length;
  };

  const ultimasMedicoes = historicos.slice(0, 6);
  const statusSensores = sensores.slice(0, 6);

  const formatarData = (data) => {
    if (!data) return "-";

    const novaData = new Date(data);

    return novaData.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const capitalizar = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const dataAtualizacao = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="homePage">
      <aside className="homeSidebar">
        <div>
          <div className="brandTop">
            <div>
              <h2>Smart City TecnoVille</h2>
              <p>Projeto Integrador · SENAI</p>
            </div>
          </div>

          <div className="sidebarUser">
            <i><FaRegUserCircle /></i>
            <span className="userLabel">Usuário logado</span>
            <h3>{usuario?.nome || "Usuário"}</h3>
            <p>{usuario?.tipo === "admin" ? "Administrador" : "Usuário"}</p>
          </div>

          <nav className="sidebarMenu">
            <button className="menuItem active">Home</button>
            <button className="menuItem" onClick={() => navigate("/historicos")}>
              Históricos
            </button>
          </nav>
        </div>

        <button className="logoutButton" onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="homeContent">
        <header className="contentHeader">
          <div>
            <h1>Olá, {usuario?.nome || "Usuário"}</h1>
            <p>Visão geral do monitoramento.</p>
          </div>

          <span className="updatedAt">Atualizado em {dataAtualizacao}</span>
        </header>

        {loading ? (
          <div className="welcomeCard">
            <h2>Carregando dados...</h2>
          </div>
        ) : (
          <>
            <section className="topCards">
              <div className="topCard">
                <div className="topCardHeader">
                  <span>Total de sensores</span>
                  <span>⚙️</span>
                </div>
                <h2>{totalSensores}</h2>
                <p>{totalSensores} cadastrados</p>
              </div>

              <div className="topCard">
                <div className="topCardHeader">
                  <span>Sensores ativos</span>
                  <span>⏺</span>
                </div>
                <h2>{sensoresAtivos}</h2>
                <p>{porcentagemAtivos}% online</p>
              </div>

              <div className="topCard">
                <div className="topCardHeader">
                  <span>Medições (24h)</span>
                  <span>📈</span>
                </div>
                <h2>{medicoes24h}</h2>
                <p>últimas 24 horas</p>
              </div>

              <div className="topCard">
                <div className="topCardHeader">
                  <span>Ambientes</span>
                  <span>🏢</span>
                </div>
                <h2>{totalAmbientes}</h2>
                <p>monitorados</p>
              </div>
            </section>

            <section className="categoriasSection">
              <h3 className="sectionTitle">CATEGORIAS</h3>

              <div className="cardsGrid">
                <div className="sensorCard" onClick={() => abrirSensor("temperatura")}>
                  <div className="sensorIcon">🌡️</div>
                  <h3>Temperatura</h3>
                  <p>{contarPorTipo("temperatura")} sensores</p>
                </div>

                <div className="sensorCard" onClick={() => abrirSensor("umidade")}>
                  <div className="sensorIcon">💧</div>
                  <h3>Umidade</h3>
                  <p>{contarPorTipo("umidade")} sensores</p>
                </div>

                <div className="sensorCard" onClick={() => abrirSensor("luminosidade")}>
                  <div className="sensorIcon">💡</div>
                  <h3>Luminosidade</h3>
                  <p>{contarPorTipo("luminosidade")} sensor(es)</p>
                </div>

                <div className="sensorCard" onClick={() => abrirSensor("contador")}>
                  <div className="sensorIcon">🔢</div>
                  <h3>Contador</h3>
                  <p>{contarPorTipo("contador")} sensor(es)</p>
                </div>
              </div>
            </section>

            <section className="bottomGrid">
              <div className="infoCard">
                <div className="infoCardHeader">
                  <h3>Últimas medições</h3>
                  <p>{ultimasMedicoes.length} registros recentes</p>
                </div>

                <div className="infoList">
                  {ultimasMedicoes.length > 0 ? (
                    ultimasMedicoes.map((item, index) => (
                      <div className="infoItem" key={item.idHistorico || index}>
                        <div className="infoItemLeft">
                          <span className="infoItemIcon">
                            {item.sensor?.sensor === "temperatura" && "🌡️"}
                            {item.sensor?.sensor === "umidade" && "💧"}
                            {item.sensor?.sensor === "luminosidade" && "💡"}
                            {item.sensor?.sensor === "contador" && "🔢"}
                            {!item.sensor?.sensor && "📍"}
                          </span>

                          <div>
                            <strong>
                              {item.sensor?.sensor
                                ? `Sensor ${capitalizar(item.sensor.sensor)}`
                                : `Medição ${index + 1}`}
                            </strong>
                            <p>{item.sensor?.sensor ? capitalizar(item.sensor.sensor) : "Sensor"}</p>
                          </div>
                        </div>

                        <div className="infoItemRight">
                          <strong>{item.valor}</strong>
                          <p>{formatarData(item.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="emptyText">Nenhuma medição encontrada.</p>
                  )}
                </div>
              </div>

              <div className="infoCard">
                <div className="infoCardHeader">
                  <h3>Status dos sensores</h3>
                  <p>
                    {sensoresAtivos} de {totalSensores} ativos
                  </p>
                </div>

                <div className="infoList">
                  {statusSensores.length > 0 ? (
                    statusSensores.map((sensor) => (
                      <div className="infoItem" key={sensor.idSensor}>
                        <div className="infoItemLeft">
                          <span className="infoItemIcon">
                            {sensor.sensor === "temperatura" && "🌡️"}
                            {sensor.sensor === "umidade" && "💧"}
                            {sensor.sensor === "luminosidade" && "💡"}
                            {sensor.sensor === "contador" && "🔢"}
                          </span>

                          <div>
                            <strong>{capitalizar(sensor.sensor)}</strong>
                            <p>ID {sensor.idSensor}</p>
                          </div>
                        </div>

                        <div className="infoItemRight">
                          <span className={sensor.status ? "badge ativo" : "badge inativo"}>
                            {sensor.status ? "ativo" : "inativo"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="emptyText">Nenhum sensor encontrado.</p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}