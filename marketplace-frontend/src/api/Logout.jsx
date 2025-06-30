import { useState } from "react";
import "../styles/Auth.css";
function LogoutForm() {
  const [message, setMessage] = useState("");

  const logout = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include", // <== важно для куки
    });

    if (response.ok) {
      setMessage("logout successful");
    } else {
      setMessage("logout failed");
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={logout}>
      <button type="submit">logout</button>
      <p>{message}</p>
    </form>
    </div>
  );
}

export default LogoutForm;