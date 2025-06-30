package com.example.Market.Service;
import com.example.Market.DTO.*;
import com.example.Market.Model.Comment;
import com.example.Market.Model.FinalSummary;
import com.example.Market.Model.Product;
import com.example.Market.Model.ReviewSummary;
import com.example.Market.Repositories.FinalSummaryRepository;
import com.example.Market.Repositories.ProductRepository;
import com.example.Market.Repositories.ReviewSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ReviewService {

    private final RestTemplate restTemplate;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final FinalSummaryRepository finalSummaryRepository;
    private final ReviewSummaryRepository reviewSummaryRepository;
    private final CommentService commentService;
    public ProductReviewResponse processReviews(ProductReviewRequest request, Long productId) {
        String summarizerUrl = "http://localhost:5000/summarize";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ProductReviewRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<ProductReviewResponseWrapper> response = restTemplate
                .postForEntity(summarizerUrl, entity, ProductReviewResponseWrapper.class);

        Product product = productRepository.findById(productId).orElseThrow();

        ProductReviewResponse data = response.getBody().getProducts().get(0);

        // Сохранение финальной выжимки
        FinalSummary finalSummary = new FinalSummary();
        finalSummary.setProduct(product);
        finalSummary.setSummary(data.getGenerated_summaries().getFinal_summary());
        finalSummary.setUsefulness(0);
        finalSummary = finalSummaryRepository.save(finalSummary);


        // Сохранение кластерных выжимок
        for (ClusterSummaryDTO cluster : data.getGenerated_summaries().getCluster_summaries()) {
            ReviewSummary reviewSummary = new ReviewSummary();
            reviewSummary.setFinalSummary(finalSummary);
            reviewSummary.setSummary(cluster.getSummary());
            reviewSummary.setAspect(cluster.getAspect());
            reviewSummary.setCount(cluster.getCount());
            reviewSummary.setReviewIds(cluster.getReview_ids());

            reviewSummaryRepository.save(reviewSummary);
        }

        data.setCurrentSummaryId(finalSummary.getId());
        data.setUsefulness(finalSummary.getUsefulness());
        return data;
    }

    public List<FinalSummary> getSortedFinalSummaries(Long productId) {
        Product product = productService.getProductById(productId);
        return product.getFinalSummaries().stream()
                .filter(f -> f.getUsefulness() != null && f.getUsefulness() >= 0)
                .sorted(Comparator.comparingInt(FinalSummary::getUsefulness).reversed())
                .collect(Collectors.toList());
    }
    public List<FinalSummary> getSortedDescFinalSummaries(Long productId) {
        return finalSummaryRepository.findByProductIdOrderByUsefulnessDesc(productId);
    }

    public ProductReviewResponse getReadySummary(Long productId) {
        List<FinalSummary> summaries = getSortedFinalSummaries(productId);

        FinalSummary selected = summaries.stream()
                .findFirst()
                .orElse(null);

        if (selected == null) return null;

        Product product = selected.getProduct();
        List<ReviewSummary> clusterSummaries = reviewSummaryRepository.findByFinalSummary(selected);

        List<Comment> comments = commentService.getCommentsByProductId(productId);
        List<ReviewDTO> reviews = comments.stream()
                .map(c -> new ReviewDTO(c.getId(), c.getContent(), c.getUsefullness()))
                .toList();

        // Сборка кластеров
        List<ClusterSummaryDTO> clusterDTOs = clusterSummaries.stream().map(r -> {
            ClusterSummaryDTO dto = new ClusterSummaryDTO();
            dto.setSummary(r.getSummary());
            dto.setAspect(r.getAspect());
            dto.setCount(r.getCount());
            dto.setReview_ids(r.getReviewIds());
            return dto;
        }).toList();

        // Сборка объекта
        GeneratedSummariesDTO summariesDTO = new GeneratedSummariesDTO();
        summariesDTO.setFinal_summary(selected.getSummary());
        summariesDTO.setCluster_summaries(clusterDTOs);

        ProductReviewResponse response = new ProductReviewResponse();
        response.setName(product.getName());
        response.setReviews(reviews);
        response.setGenerated_summaries(summariesDTO);

        response.setCurrentSummaryId(selected.getId());
        response.setUsefulness(selected.getUsefulness());
        return response;
    }

    public ProductReviewResponse getNextSummary(Long productId, Long currentSummaryId) {
        List<FinalSummary> sortedSummaries = getSortedFinalSummaries(productId);

        // Найдём текущую выжимку
        FinalSummary current = sortedSummaries.stream()
                .filter(s -> s.getId().equals(currentSummaryId))
                .findFirst()
                .orElse(null);

        if (current == null) return null;

        // Найдём следующую по полезности (меньше текущей)
        FinalSummary next = sortedSummaries.stream()
                .filter(s -> s.getUsefulness() < current.getUsefulness())
                .findFirst()
                .orElse(null);

        if (next == null) return null;

        // Сборка ответа
        Product product = next.getProduct();
        List<ReviewSummary> clusterSummaries = reviewSummaryRepository.findByFinalSummary(next);

        List<Comment> comments = commentService.getCommentsByProductId(productId);
        List<ReviewDTO> reviews = comments.stream()
                .map(c -> new ReviewDTO(c.getId(), c.getContent(), c.getUsefullness()))
                .toList();

        List<ClusterSummaryDTO> clusterDTOs = clusterSummaries.stream().map(r -> {
            ClusterSummaryDTO dto = new ClusterSummaryDTO();
            dto.setSummary(r.getSummary());
            dto.setAspect(r.getAspect());
            dto.setCount(r.getCount());
            dto.setReview_ids(r.getReviewIds());
            return dto;
        }).toList();

        GeneratedSummariesDTO summariesDTO = new GeneratedSummariesDTO();
        summariesDTO.setFinal_summary(next.getSummary());
        summariesDTO.setCluster_summaries(clusterDTOs);

        ProductReviewResponse response = new ProductReviewResponse();
        response.setName(product.getName());
        response.setReviews(reviews);
        response.setGenerated_summaries(summariesDTO);


        response.setCurrentSummaryId(next.getId());
        response.setUsefulness(next.getUsefulness());
        return response;
    }

    public ProductReviewResponse getPrevSummary(Long productId, Long currentSummaryId) {
        List<FinalSummary> sortedSummaries = getSortedDescFinalSummaries(productId); // отсортированы по usefulness DESC

        // Найдём индекс текущей выжимки
        int currentIndex = -1;
        for (int i = 0; i < sortedSummaries.size(); i++) {
            if (sortedSummaries.get(i).getId().equals(currentSummaryId)) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex <= 0) return null;

        FinalSummary previous = sortedSummaries.get(currentIndex - 1); // предыдущая по полезности

        Product product = previous.getProduct();
        List<ReviewSummary> clusterSummaries = reviewSummaryRepository.findByFinalSummary(previous);

        List<Comment> comments = commentService.getCommentsByProductId(productId);
        List<ReviewDTO> reviews = comments.stream()
                .map(c -> new ReviewDTO(c.getId(), c.getContent(), c.getUsefullness()))
                .toList();

        List<ClusterSummaryDTO> clusterDTOs = clusterSummaries.stream().map(r -> {
            ClusterSummaryDTO dto = new ClusterSummaryDTO();
            dto.setSummary(r.getSummary());
            dto.setAspect(r.getAspect());
            dto.setCount(r.getCount());
            dto.setReview_ids(r.getReviewIds());
            return dto;
        }).toList();

        GeneratedSummariesDTO summariesDTO = new GeneratedSummariesDTO();
        summariesDTO.setFinal_summary(previous.getSummary());
        summariesDTO.setCluster_summaries(clusterDTOs);

        ProductReviewResponse response = new ProductReviewResponse();
        response.setName(product.getName());
        response.setReviews(reviews);
        response.setGenerated_summaries(summariesDTO);
        response.setCurrentSummaryId(previous.getId());
        response.setUsefulness(previous.getUsefulness());

        response.setCurrentSummaryId(previous.getId());
        response.setUsefulness(previous.getUsefulness());
        return response;
    }

    public int updateUsefulness(Long summaryId, String direction) {
        FinalSummary summary = finalSummaryRepository.findById(summaryId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if ("up".equals(direction)) {
            summary.setUsefulness(summary.getUsefulness() + 1);
        } else if ("down".equals(direction)) {
            summary.setUsefulness(summary.getUsefulness() - 1);
        }

        finalSummaryRepository.save(summary);
        return summary.getUsefulness();
    }

}
