package com.example.Market.Service;


import com.example.Market.Model.Product;
import com.example.Market.Model.ProductImage;
import com.example.Market.Repositories.ProductRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void addImageToProduct(Long productId, String imageUrl) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductImage productImage = new ProductImage();
        productImage.setImageUrl(imageUrl);
        productImage.setProduct(product);

        product.getImages().add(productImage);
        productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product product = getProductById(id);
        product.setName(updatedProduct.getName());
        product.setPrice(updatedProduct.getPrice());
        product.setCategory(updatedProduct.getCategory());
        product.setQuan(updatedProduct.getQuan());
        product.setDescription(updatedProduct.getDescription());
        return productRepository.save(product);
    }
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    public void decreaseQuantity(Long productId, int quantity) {
        Product product = getProductById(productId);
        if (product.getQuan() < quantity) {
            throw new RuntimeException("Not enough quantity in stock");
        }
        product.setQuan(product.getQuan() - quantity);
        productRepository.save(product);
    }
}