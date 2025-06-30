import { useState } from "react";

import "../styles/Auth.css";
function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", 
      body: JSON.stringify({ username, role, password })
    });

    if (response.ok) {
      setMessage("Login successful");
    } else {
      setMessage("Login failed");
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={login}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
          <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p>{message}</p>
      </form>
    </div>
  );
}

export default RegisterForm;