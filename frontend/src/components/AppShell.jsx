import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiActivity, FiCpu, FiHome, FiLayers, FiLogOut, FiThermometer, FiClock } from "react-icons/fi";
import { clearAuth, getUser, isAdmin } from "../utils/auth";
import "./appShell.css";

export default function AppShell({ title, subtitle, actions, children }) {
  const user = getUser();
  const admin = isAdmin(user);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: admin ? "/admin/home" : "/user/home", label: "Home", icon: <FiHome /> },
    { to: "/sensores", label: "Sensores", icon: <FiThermometer /> },
    { to: "/historicos", label: "Históricos", icon: <FiActivity /> },
    { to: "/historicos-recentes", label: "Recentes", icon: <FiClock /> },
    ...(admin
      ? [
          { to: "/ambientes", label: "Ambientes", icon: <FiLayers /> },
          { to: "/microcontroladores", label: "Microcontroladores", icon: <FiCpu /> },
        ]
      : []),
  ];

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <span className="brand-badge">SC</span>
            <div>
              <strong>Smart City</strong>
              <p>TecnoVille</p>
            </div>
          </div>

          <nav className="nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? "nav-link active" : "nav-link"}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button className="logout-btn" onClick={logout}>
          <FiLogOut />
          Sair
        </button>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="page-header-right">
            <div className="user-chip">
              <strong>{user?.nome || "Usuário"}</strong>
              <span>{user?.tipo || "Sem perfil"}</span>
            </div>
            {actions}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
