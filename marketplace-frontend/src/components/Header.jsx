import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css';

const Header = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/profile", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        if (data.avatarUrl) {
          setAvatarUrl(`http://localhost:8080${data.avatarUrl}`);
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3698/3698156.png"
          alt="Лого"
        />
      </Link>
      <h2>KintMarket</h2>
      <nav className="nav">
        <Link to="/basket">Корзина</Link>
        <Link to="/orders">Заказы</Link>
      </nav>
      <Link to="/profile">
        <img
          className="profile-icon"
          src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/1077/1077063.png"}
          alt="Профиль"
        />
      </Link>
    </header>
  );
};

export default Header;
