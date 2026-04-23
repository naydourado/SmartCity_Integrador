import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

export default function RoleRoute({ children, allow = [] }) {
  const location = useLocation();
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || !allow.includes(user.tipo)) {
    return <Navigate to="/user/home" replace />;
  }

  return children;
}
