import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

export default function Register() {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  const [form, setForm] = useState({
    username: "",
    email: "",
    nome: "",
    telefone: "",
    tipo: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    async function buscarTipos() {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/usuarios/tipo-choices/");
        setTipos(res.data || []);
      } catch (error) {
        console.log("Erro ao buscar tipos:", error);
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    }

    buscarTipos();
  }, []);

  const setField = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const validar = () => {
    if (!form.username || !form.nome || !form.tipo || !form.password) {
      return "Preencha os campos obrigatórios.";
    }

    if (form.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    if (form.password !== form.password2) {
      return "As senhas não conferem.";
    }

    return "";
  };

  const cadastrar = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const erro = validar();
    if (erro) {
      setMsg({ type: "error", text: erro });
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username: form.username,
        email: form.email,
        nome: form.nome,
        telefone: form.telefone,
        tipo: form.tipo,
        password: form.password,
      });

      setMsg({ type: "success", text: "Cadastro realizado com sucesso!" });

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (error) {
      console.log("Erro no cadastro:", error);

      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey]);
        setMsg({ type: "error", text: firstMsg });
      } else {
        setMsg({ type: "error", text: "Não foi possível cadastrar." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="registerLeft">
        <div className="brandTop">
          <div className="brandIcon">S</div>
          <div>
            <h2>Smart City TecnoVille</h2>
            <p>Projeto Integrador · SENAI</p>
          </div>
        </div>

        <div className="leftContent">
          <h1>Cadastre-se para acessar o painel inteligente.</h1>
          <p>
            Crie sua conta e acompanhe os sensores de temperatura, umidade,
            luminosidade e contagem em tempo real.
          </p>
        </div>

        <div className="leftFooter">© 2026 SENAI</div>
      </div>

      <div className="registerRight">
        <div className="registerCard">
          <div className="registerHeader">
            <h1 className="registerTitle">Criar conta</h1>
            <p className="registerSubtitle">Preencha seus dados para começar.</p>
          </div>

          <form className="registerForm" onSubmit={cadastrar}>
            <div className="grid2">
              <div className="field">
                <label className="label">Usuário *</label>
                <input
                  className="input"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">E-mail</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label className="label">Nome *</label>
                <input
                  className="input"
                  value={form.nome}
                  onChange={(e) => setField("nome", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Telefone</label>
                <input
                  className="input"
                  value={form.telefone}
                  onChange={(e) => setField("telefone", e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Tipo de usuário *</label>
              <select
                className="input"
                value={form.tipo}
                onChange={(e) => setField("tipo", e.target.value)}
                disabled={loadingTipos}
              >
                <option value="">{loadingTipos ? "Carregando..." : "Selecione..."}</option>
                {tipos.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid2">
              <div className="field">
                <label className="label">Senha *</label>
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Confirmar senha *</label>
                <input
                  className="input"
                  type="password"
                  value={form.password2}
                  onChange={(e) => setField("password2", e.target.value)}
                />
              </div>
            </div>

            {msg.text && (
              <div className={msg.type === "success" ? "alert success" : "alert"}>
                {msg.text}
              </div>
            )}

            <button className="btnPrimary" type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            <p className="loginText">
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}