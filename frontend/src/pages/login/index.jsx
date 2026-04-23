import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { saveAuth } from "../../utils/auth";
import "./styles.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokenResponse = await axios.post("http://127.0.0.1:8000/api/token/", form);
      const access = tokenResponse.data.access;

      const meResponse = await axios.get("http://127.0.0.1:8000/api/usuarios/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const user = meResponse.data;
      saveAuth(access, user);

      const home = ["admin", "Administrador"].includes(user?.tipo) ? "/admin/home" : "/user/home";
      navigate(home);
    } catch (err) {
      setError("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <span className="hero-badge">Projeto Integrador · SENAI</span>
        <h1>Smart City TecnoVille</h1>
        <h2>Monitore sua cidade inteligente em tempo real.</h2>
          <p>
            Temperatura, umidade, luminosidade e contagem — todos os seus
            sensores IoT em um único painel.
          </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        <p>Acesse o sistema de monitoramento.</p>

        <label>
          Usuário
          <input
            className="auth-input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Senha
          <input
            className="auth-input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <span className="auth-link-text">
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </span>
      </form>
    </div>
  );
}
