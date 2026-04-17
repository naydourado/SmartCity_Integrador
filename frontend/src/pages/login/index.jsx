import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const logar = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: user,
        password: password,
      });

      const access = response.data.access;

      localStorage.setItem("token", access);

      const me = await axios.get("http://127.0.0.1:8000/api/usuarios/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      localStorage.setItem("usuario", JSON.stringify(me.data));

      if (!me.data.is_active) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setMessage("Usuário inativo. Contate o administrador.");
        return;
      }

      if (me.data.tipo === "admin") {
        navigate("/admin/home");
      } else {
        navigate("/user/home");
      }
    } catch (error) {
      console.log("Erro no login:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setMessage("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginLeft">
        <div className="brandTop">
          <div>
            <h2>Smart City TecnoVille</h2>
            <p>Projeto Integrador · SENAI</p>
          </div>
        </div>

        <div className="leftContent">
          <h1>Monitore sua cidade inteligente em tempo real.</h1>
          <p>
            Temperatura, umidade, luminosidade e contagem — todos os seus
            sensores IoT em um único painel.
          </p>
        </div>

        <div className="leftFooter">© 2026 SENAI</div>
      </div>

      <div className="loginRight">
        <div className="loginCard">
          <div className="loginHeader">
            <h1 className="loginTitle">Entrar</h1>
            <p className="loginSubtitle">Acesse o painel de monitoramento.</p>
          </div>

          <form className="loginForm" onSubmit={logar}>
            <div className="field">
              <label className="label">Usuário</label>
              <input
                className="input"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {message && <div className="alert">{message}</div>}

            <button className="btnPrimary" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="registerText">
              Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}