import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Home.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import img1 from "../images/image.png"; // Временное изображение

const API_URL = "http://localhost:8080/market/products";

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const filteredProducts = products.filter((product) => {
  const matchesCategory = categoryFilter ? product.category === categoryFilter : true;

  const searchTerms = searchQuery.toLowerCase().split(" ").filter(Boolean);
  const productName = product.name.toLowerCase();

  const matchesSearch = searchTerms.every(term => productName.includes(term));

  return matchesCategory && matchesSearch;
});

  const [sortOrder, setSortOrder] = useState("");
  const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortOrder === "asc") return a.price - b.price;
  if (sortOrder === "desc") return b.price - a.price;
  return 0;
});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_URL, {
          withCredentials: true,
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке товаров:", error);
      }
    };

    fetchProducts();
  }, []);


  return (
    <div>
      <Header />
      <main className="main-content">
        <h1>Товары</h1>
        <div className="product-filter">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="product-filter-input"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="product-filter-select"
          >
            <option value="">Все категории</option>
            {[...new Set(products.map(p => p.category))].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="filter-bar">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="">Сортировка по</option>
            <option value="asc">Цена: по возрастанию</option>
            <option value="desc">Цена: по убыванию</option>
          </select>
        </div>
        <div className="product-grid">

          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="product-image-wrapper">

              <img
                src={
                  product.images && product.images.length > 0
                    ? `http://localhost:8080${product.images[0].imageUrl}`
                    : img1
                }
                alt={product.name}
                className="product-image"
              />


              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Категория: {product.category}</p>
                <p>Стоимость: {product.price} ₽</p>
              </div>

            </div>
          ))}
          
        </div>
      </main>
    </div>
  );
};

export default Home;
