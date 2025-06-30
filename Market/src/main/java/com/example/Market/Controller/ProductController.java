package com.example.Market.Controller;

import com.example.Market.Model.Product;
import com.example.Market.Model.ProductImage;
import com.example.Market.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/market")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final String UploadDirPicture = "uploads/";
    @GetMapping("/products")
    public List<Product> getAll() {
        return productService.getAllProducts();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadMultipleProductPictures(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("id") Long id
    ) throws IOException {

        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UploadDirPicture, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            productService.addImageToProduct(id, "/market/files/" + fileName); // Используем уже чистый метод
        }

        return ResponseEntity.ok("Фотографии продукта успешно загружены и сохранены");
    }
    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) throws IOException {
        try {
            Path file = Paths.get(UploadDirPicture, filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                return ResponseEntity
                        .ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                throw new RuntimeException("Файл не найден или не читается: " + filename);
            }
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при загрузке файла: " + filename, e);
        }
    }


    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
    @PostMapping
    @PreAuthorize("hasRole('ROLE_Admin')")
    public Product create(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_Admin')")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_Admin')")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PatchMapping("/{id}/decrease")
    public void decreaseQuantity(@PathVariable Long id, @RequestParam int quantity) {
        productService.decreaseQuantity(id, quantity);
    }
}


