import React, { useState } from 'react';
import axios from 'axios';

const SummarizeButton = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8080/market/summarize',
        {
          name: "Пример товара",
          reviews: [
            { id: 1, text: "Хороший продукт, понравился." },
            { id: 2, text: "Плохая упаковка, но сам товар норм." }
          ]
        },
        {
          withCredentials: true 
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error('Ошибка при запросе:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleSummarize}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Обработка..." : "Сгенерировать выжимку"}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Итоговая выжимка:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SummarizeButton;
