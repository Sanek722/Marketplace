import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/check", {
          credentials: "include",
        });
        console.log(res);
        setIsAuthorized(res.ok);
      } catch {
        setIsAuthorized(false);
      }
    };

    check();
  }, []);

  if (isAuthorized === null) return <div>Загрузка...</div>;
  if (!isAuthorized) return <Navigate to="/" />;

  return children;
};

export default ProtectedAdminRoute;
