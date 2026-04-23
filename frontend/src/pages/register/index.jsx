import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../login/styles.css";

const initialState = {
  nome: "",
  username: "",
  email: "",
  password: "",
  telefone: "",
  tipo: "Usuário",
};

export default function Register() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/usuarios/", form);
      setMessage("Usuário cadastrado com sucesso.");
      setForm(initialState);
    } catch (err) {
      setError("Não foi possível cadastrar. Verifique se o endpoint de usuários aceita esse formato.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <span className="hero-badge">Cadastro</span>
        <h1>Novo usuário</h1>
        <p>Esta página é desejável no projeto e já deixa o front preparado.</p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Cadastrar</h2>
        <label>Nome<input className="auth-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></label>
        <label>Username<input className="auth-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Email<input className="auth-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Telefone<input className="auth-input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></label>
        <label>Senha<input className="auth-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        <label>Tipo
          <select className="auth-input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option>Usuário</option>
            <option>Administrador</option>
          </select>
        </label>

        {message && <div className="auth-error" style={{ background: "rgba(16,185,129,.15)", borderColor: "rgba(16,185,129,.35)" }}>{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <button className="auth-button" type="submit" disabled={loading}>{loading ? "Salvando..." : "Cadastrar"}</button>
        <span className="auth-link-text">Já tem conta? <Link to="/login">Entrar</Link></span>
      </form>
    </div>
  );
}
