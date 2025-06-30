import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/Profile.css";

import Header from "../components/Header";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/profile", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = response.data;
        setUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: `http://localhost:8080${data.avatarUrl}` // полный путь к картинке
        });
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditedUser(user);
    setEditMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      // Сначала обновляем текстовые данные
      await axios.put("http://localhost:8080/user/profile/update", {
        name: editedUser.name,
        email: editedUser.email,
        phone: editedUser.phone
      }, { withCredentials: true });

      // Потом, если выбрана новая картинка, загружаем её
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        await axios.post("http://localhost:8080/user/files/upload", formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          }
        });
      }

      // После успешного сохранения выходим из режима редактирования
      setUser(editedUser);
      setEditMode(false);
      window.location.reload(); // Можно без перезагрузки, но для простоты
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="profile-container">
        {!user ? (
          <div>
            <h2>Вы не авторизованы</h2>
            <div>
            <Link to="/login">Войти в аккаунт</Link>
            </div>
            <div>
            <Link to="/register">Регистрация</Link>
            </div>
          </div>
        ) : (
          <div className="profile-card">
            {editMode ? (
              <div>
                <img src={user.avatar} alt="Аватар" className="avatar" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <input
                  type="text"
                  name="name"
                  value={editedUser.name || ""}
                  onChange={handleInputChange}
                  placeholder="Имя"
                />
                <input
                  type="email"
                  name="email"
                  value={editedUser.email || ""}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
                <input
                  type="text"
                  name="phone"
                  value={editedUser.phone || ""}
                  onChange={handleInputChange}
                  placeholder="Телефон"
                />
                <div className="button-group">
                  <button className="save-btn" onClick={handleSave}>Сохранить</button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div>
                <img src={user.avatar} alt="Аватар" className="avatar" />
                <h2>{user.name}</h2>
                <p>Email: {user.email}</p>
                <p>Телефон: {user.phone}</p>

                <div className="button-group">
                  <button className="edit-btn" onClick={handleEditClick}>Редактировать</button>
                  <button className="logout-btn" onClick={() => {
                    window.location.href = "/logout";
                  }}>
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
