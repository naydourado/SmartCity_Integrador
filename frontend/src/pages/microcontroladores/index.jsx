import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../sensores/styles.css";

export default function Microcontroladores() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function buscar() {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/microcontroladores/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setDados(res.data);
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    buscar();
  }, []);

  const sair = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="historicosPage">
      <aside className="historicosSidebar">
        <div>
          <div className="brandTop">
            <div className="brandIcon">S</div>
            <div>
              <h2>Smart City</h2>
              <p>SENAI</p>
            </div>
          </div>

          <nav className="sidebarMenu">
            <button onClick={() => navigate("/admin/home")}>Home</button>
            <button onClick={() => navigate("/sensores")}>Sensores</button>
            <button className="menuItem active">Microcontroladores</button>
          </nav>
        </div>

        <button className="logoutButton" onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="historicosContent">
        <h1>Microcontroladores</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="historicosTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Modelo</th>
                <th>MAC</th>
                <th>Status</th>
                <th>Ambiente</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.idMicro}>
                  <td>{item.idMicro}</td>
                  <td>{item.modelo}</td>
                  <td>{item.mac_address}</td>
                  <td>
                    {item.status ? "Ativo" : "Inativo"}
                  </td>
                  <td>{item.ambiente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}