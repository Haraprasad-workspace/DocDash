import { useNavigate } from "react-router-dom";
import { logout } from "../lib/logout";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  if (!currentUser) return null;

  return (
    <header>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <span>Print App</span>

        <button onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}

export default Header;
