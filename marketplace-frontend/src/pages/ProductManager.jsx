import React, { useState, useEffect } from 'react';
import axios from 'axios';
function ProductManager() {
    const [products, setProducts] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [newProduct, setNewProduct] = useState({
      name: '',
      description: '',
      price: '',
      category: '',
      quan: '',
    });

    const [editingProductId, setEditingProductId] = useState(null);
    const [editProduct, setEditProduct] = useState({});
    const [editFiles, setEditFiles] = useState([]);
    

    const startEditing = (product) => {
      setEditingProductId(product.id);
      setEditProduct({ ...product });
      setEditFiles([]);
    };
    
    // При изменении инпутов редактирования
    const handleEditChange = (e) => {
      setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
    };
    
    // Обработка новых файлов
    const handleEditFileChange = (e) => {
      setEditFiles([...e.target.files]);
    };
    
    // Сохраняем отредактированный товар
    const handleSaveEdit = async () => {
      try {
        await axios.put(`http://localhost:8080/market/${editingProductId}`, editProduct, { withCredentials: true });
    
        if (editFiles.length > 0) {
          const formData = new FormData();
          editFiles.forEach(file => formData.append('files', file));
          formData.append('id', editingProductId);
    
          await axios.post('http://localhost:8080/market/upload', formData, { withCredentials: true });
        }
    
        setEditingProductId(null);
        fetchProducts();
      } catch (error) {
        console.error('Ошибка при редактировании товара', error);
      }
    };

    
    useEffect(() => {
      fetchProducts();
    }, []);

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/market/products', { withCredentials: true });
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке товаров', error);
      }
    };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

    const handleInputChange = (e) => {
      setNewProduct({
        ...newProduct,
        [e.target.name]: e.target.value,
      });
    };

  const handleAddProduct = async () => {
    try {
      const response = await axios.post('http://localhost:8080/market', newProduct, { withCredentials: true });
      const createdProduct = response.data;

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);  // важно: одно и то же имя!
        });
        formData.append('id', createdProduct.id);
      
        await axios.post('http://localhost:8080/market/upload', formData, {
          withCredentials: true
        });
      }

      setNewProduct({ name: '', description: '', price: '', category: '', quan: '' });
      setSelectedFile(null);
      fetchProducts();
    } catch (error) {
      console.error('Ошибка при добавлении товара', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/market/${id}`, {withCredentials: true});
      fetchProducts();
    } catch (error) {
      console.error('Ошибка при удалении товара', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Менеджер товаров</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Добавить товар</h3>
        <input type="text" name="name" placeholder="Название" value={newProduct.name} onChange={handleInputChange} /><br />
        <input type="text" name="description" placeholder="Описание" value={newProduct.description} onChange={handleInputChange} /><br />
        <input type="number" name="price" placeholder="Цена" value={newProduct.price} onChange={handleInputChange} /><br />
        <input type="text" name="category" placeholder="Категория" value={newProduct.category} onChange={handleInputChange} /><br />
        <input type="number" name="quan" placeholder="Количество" value={newProduct.quan} onChange={handleInputChange} /><br />
        <input type="file" onChange={handleFileChange} /><br />
        <button onClick={handleAddProduct}>Добавить товар</button>
      </div>

      <hr />

      {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            {editingProductId === product.id ? (
              <>
                <input type="text" name="name" value={editProduct.name} onChange={handleEditChange} /><br />
                <input type="text" name="description" value={editProduct.description} onChange={handleEditChange} /><br />
                <input type="number" name="price" value={editProduct.price} onChange={handleEditChange} /><br />
                <input type="text" name="category" value={editProduct.category} onChange={handleEditChange} /><br />
                <input type="number" name="quan" value={editProduct.quan} onChange={handleEditChange} /><br />
                <input type="file" multiple onChange={handleEditFileChange} /><br />
                <button onClick={handleSaveEdit}>Сохранить</button>
                <button onClick={() => setEditingProductId(null)}>Отмена</button>
              </>
            ) : (
              <>
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <p>Цена: {product.price}₽</p>
                {product.images && product.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {product.images.map((img) => (
                      <img
                        key={img.id}
                        src={`http://localhost:8080${img.imageUrl}`}
                        alt="Product"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}
                <button onClick={() => startEditing(product)}>Редактировать</button>
                <button onClick={() => handleDeleteProduct(product.id)}>Удалить</button>
              </>
            )}
          </div>
        ))}
    </div>
  );
}

export default ProductManager;
