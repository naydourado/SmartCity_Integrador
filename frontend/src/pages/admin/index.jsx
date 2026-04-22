import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

export default function Home() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [historicos, setHistoricos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ AGORA ESTÁ NO LUGAR CERTO
  const isAdmin = usuario?.tipo === "admin";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!token) {
      navigate("/login");
      return;
    }

    if (usuarioSalvo) {
      const usuarioObj = JSON.parse(usuarioSalvo);
      setUsuario(usuarioObj);
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
  const sensoresAtivos = sensores.filter((s) => s.status).length;
  const medicoes24h = historicos.length;
  const totalAmbientes = ambientes.length;

  const porcentagemAtivos =
    totalSensores > 0 ? Math.round((sensoresAtivos / totalSensores) * 100) : 0;

  const contarPorTipo = (tipo) =>
    sensores.filter((s) => s.sensor === tipo).length;

  const ultimasMedicoes = historicos.slice(0, 6);
  const statusSensores = sensores.slice(0, 6);

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  };

  const capitalizar = (t) => t?.charAt(0).toUpperCase() + t?.slice(1);

  const dataAtualizacao = new Date().toLocaleString("pt-BR");

  return (
    <div className="homePage">
      <aside className="homeSidebar">
        <div> {/* ✅ AGORA FECHA CORRETAMENTE */}
          <div className="brandTop">
            <div>
              <h2>Smart City TecnoVille</h2>
              <p>Projeto Integrador · SENAI</p>
            </div>
          </div>

          <nav className="sidebarMenu">
            <button className="menuItem active">Home</button>

            <button className="menuItem" onClick={() => navigate("/sensores")}>
              Sensores
            </button>

            <button className="menuItem" onClick={() => navigate("/historicos")}>
              Históricos
            </button>

            <button
              className="menuItem"
              onClick={() => navigate("/historicos-recentes")}
            >
              Históricos recentes
            </button>

            {isAdmin && (
              <>
                <button className="menuItem" onClick={() => navigate("/ambientes")}>
                  Ambientes
                </button>

                <button
                  className="menuItem"
                  onClick={() => navigate("/microcontroladores")}
                >
                  Microcontroladores
                </button>
              </>
            )}
          </nav>
        </div> {/* ✅ FECHAMENTO QUE FALTAVA */}

        <button className="logoutButton" onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="homeContent">
        <header className="contentHeader">
          <div>
            <h1>Olá, {usuario?.nome || "Usuário"}!</h1>
            <p>Visão geral do monitoramento.</p>
          </div>

          <span>Atualizado em {dataAtualizacao}</span>
        </header>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <h3>Total sensores: {totalSensores}</h3>
            <h3>Ativos: {sensoresAtivos}</h3>
            <h3>Ambientes: {totalAmbientes}</h3>
          </>
        )}
      </main>
    </div>
  );
}