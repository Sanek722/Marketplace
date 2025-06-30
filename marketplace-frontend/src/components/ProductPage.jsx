import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import AuthErrorModal from "./AuthErrorModal";
import "../styles/ProductPage.css";

const API_URL = "http://localhost:8080";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [summaryText, setSummaryText] = useState(null);
  const [clusterSummaries, setClusterSummaries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSummaryId, setCurrentSummaryId] = useState(null);
  const [usefulness, setUsefulness] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const images = product?.images?.map(img => `http://localhost:8080${img.imageUrl}`) || [];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const fetchData = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/market/${id}`, { credentials: "include" });
      const productData = await prodRes.json();
      setProduct(productData);

      const commentRes = await fetch(`${API_URL}/market/comments/product/${id}`, { credentials: "include" });
      const commentData = await commentRes.json();
      setComments(commentData);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const res = await fetch(`${API_URL}/market/basket/add/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Unauthorized");
    } catch (err) {
      if (err.message === "Unauthorized") setIsModalOpen(true);
      else console.error("Ошибка добавления в корзину:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;
    try {
      const res = await fetch(`${API_URL}/market/comments/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, content: newComment }),
      });

      if (!res.ok) throw new Error("Unauthorized");

      setNewComment("");
      fetchData();
    } catch (err) {
      if (err.message === "Unauthorized") setIsModalOpen(true);
      else console.error("Ошибка добавления комментария:", err);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch(`${API_URL}/market/summarize/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      console.log(data);
      setSummaryText(data.generated_summaries?.final_summary || "");
      setClusterSummaries(data.generated_summaries?.cluster_summaries || []);
      setCurrentSummaryId(data.currentSummaryId); 
      setUsefulness(data.usefulness || 0);
    } catch (err) {
      if (err.message === "Unauthorized") setIsModalOpen(true);
      else console.error("Ошибка при генерации выжимки:", err);
    } finally {
    setIsSummarizing(false);
  }
  };


const handleShowBestSummary = async () => {
  try {
    const res = await fetch(`${API_URL}/market/SortSummary/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    console.log(data);
    setSummaryText(data.generated_summaries?.final_summary || "");
    setClusterSummaries(data.generated_summaries?.cluster_summaries || []);
    setCurrentSummaryId(data.currentSummaryId); 
    setUsefulness(data.usefulness || 0);
  } catch (err) {
    if (err.message === "Unauthorized") setIsModalOpen(true);
    else console.error("Ошибка при получении готовой выжимки:", err);
  }
};


const handleNextSummary = async () => {
  if (!currentSummaryId) {
    alert("Сначала выберите начальную выжимку");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/market/nextSummary/${id}?currentSummaryId=${currentSummaryId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 204) {
        alert("Больше выжимок нет.");
        return;
      }
      throw new Error("Ошибка при загрузке следующей выжимки");
    }

    const data = await res.json();
    setSummaryText(data.generated_summaries?.final_summary || "");
    setClusterSummaries(data.generated_summaries?.cluster_summaries || []);
    setCurrentSummaryId(data.currentSummaryId); 
    setUsefulness(data.usefulness || 0);
  } catch (err) {
    console.error(err);
  }
};

const handlePrevSummary = async () => {
  if (!currentSummaryId) {
    alert("Сначала выберите начальную выжимку");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/market/prevSummary/${id}?currentSummaryId=${currentSummaryId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 204) {
        alert("Больше выжимок нет.");
        return;
      }
      throw new Error("Ошибка при загрузке следующей выжимки");
    }

    const data = await res.json();
    setSummaryText(data.generated_summaries?.final_summary || "");
    setClusterSummaries(data.generated_summaries?.cluster_summaries || []);
    setCurrentSummaryId(data.currentSummaryId); 
    setUsefulness(data.usefulness || 0);
  } catch (err) {
    console.error(err);
  }
};

const handleRateSummary = async (direction) => {
  if (!currentSummaryId) return;

  try {
    const res = await fetch(`${API_URL}/market/summary/${currentSummaryId}/rate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }), // direction: "up" или "down"
    });

    if (!res.ok) throw new Error("Ошибка при оценке выжимки");

    const data = await res.json();
    setUsefulness(data.usefulness); // обновляем значение
  } catch (err) {
    console.error(err);
  }
};

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!product) return <p>Загрузка...</p>;

  return (
    <div>
      <Header />
      <div className="product-page">
        <div className="product-page-top-section">
          <div className="product-page-card">
            <div className="product-page-info">
              <h2>{product.name}</h2>
              <p><strong>Категория:</strong> {product.category}</p>
              <p><strong>Описание:</strong> {product.description}</p>
              <p><strong>Цена:</strong> {product.price} ₽</p>
              <button onClick={handleAddToCart} className="product-page-add-to-cart-button">
                Добавить в корзину
              </button>
            </div>

            {images.length > 0 && (
              <div className="product-page-image-container">
                <img src={images[currentIndex]} alt="Product" className="product-page-slider-image" />
                <button className="product-page-slider-button prev" onClick={prevSlide}>‹</button>
                <button className="product-page-slider-button next" onClick={nextSlide}>›</button>
              </div>
            )}
          </div>
        </div>

        <div className="product-page-container">
          <div className="product-page-comment-section">
            <h3>Комментарии:</h3>
            <ul className="product-page-comment-list">
              {comments.length === 0 ? (
                <p>Комментариев нет</p>
              ) : (
                comments.map(comment => (
                  <li key={comment.id} className="product-page-comment-item">
                    <strong>{comment.username}</strong>: {comment.content}
                  </li>
                ))
              )}
            </ul>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              rows={3}
              className="product-page-comment-input"
            />
            <button onClick={handleCommentSubmit} className="product-page-comment-button">Отправить</button>
          </div>

          <div className="product-page-summary-section">
            <div className="product-page-summary-buttons">
              <button onClick={handleSummarize} className="product-page-summarize-button" disabled={isSummarizing}>
                {isSummarizing ? "Генерация..." : "Генерация выжимки отзывов"}
              </button>
              <button onClick={handleShowBestSummary} className="product-page-summarize-button">
                Показать лучшую выжимку
              </button>
            </div>

            {summaryText && (
              <>
                <h3>Общая выжимка:</h3>
                <p className="product-page-final-summary">{summaryText}</p>

                <div className="product-page-summary-feedback">
                  <p><strong>Пользователей посчитавших полезным:</strong> {usefulness}</p>
                  <button onClick={() => handleRateSummary("up")} className="rate-button">👍 Полезно</button>
                  <button onClick={() => handleRateSummary("down")} className="rate-button">👎 Не полезно</button>
                </div>

                <div className="product-page-summarize-navigation">
                  <button onClick={handlePrevSummary} className="product-page-summarize-button">
                    Предыдущая выжимка
                  </button>
                  <button onClick={handleNextSummary} className="product-page-summarize-button">
                    Следующая выжимка
                  </button>
                </div>
              </>
            )}


            {clusterSummaries.length > 0 && (
              <>
                <h4>Выжимки по схожим темам:</h4>
                <div className="product-page-cluster-cards">
                  {clusterSummaries.map((cluster, index) => (
                    <details key={index} className="product-page-cluster-card">
                      <summary>Выжимка #{index + 1}</summary>
                      <p><strong>Аспекты:</strong> {cluster.aspect}</p>
                      <p><strong>Выжимка:</strong><br />{cluster.summary}</p>
                      <p><strong>Количество отзывов:</strong> {cluster.count}</p>
                      <p><strong>ID отзывов:</strong> {cluster.review_ids.join(", ")}</p>
                    </details>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AuthErrorModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ProductPage;
