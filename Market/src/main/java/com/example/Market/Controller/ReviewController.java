package com.example.Market.Controller;

import com.example.Market.DTO.GeneratedSummariesDTO;
import com.example.Market.DTO.ProductReviewRequest;
import com.example.Market.DTO.ProductReviewResponse;
import com.example.Market.DTO.ReviewDTO;
import com.example.Market.Model.Comment;
import com.example.Market.Model.FinalSummary;
import com.example.Market.Model.Product;
import com.example.Market.Repositories.ProductRepository;
import com.example.Market.Service.CommentService;
import com.example.Market.Service.ProductService;
import com.example.Market.Service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/market")
public class ReviewController {

    private final ReviewService reviewService;
    private final CommentService commentService;
    private final ProductService productService;

    @PostMapping("/summarize/{id}")
    public ResponseEntity<ProductReviewResponse> summarizeById(@PathVariable("id") Long productId) {
        Product product = productService.getProductById(productId);
        List<Comment> comments = commentService.getCommentsByProductId(productId);

        List<ReviewDTO> reviews = comments.stream()
                .map(c -> new ReviewDTO(c.getId(), c.getContent(), c.getUsefullness()))
                .toList();

        ProductReviewRequest request = new ProductReviewRequest();
        request.setName(product.getName());
        request.setReviews(reviews);

        return ResponseEntity.ok(reviewService.processReviews(request, productId));
    }
    @GetMapping("/SortSummary/{productId}")
    public ResponseEntity<ProductReviewResponse> getFinalSummaryByUsefulness(
            @PathVariable Long productId,
            @RequestParam(required = false) List<Long> excludeIds) {

        ProductReviewResponse response = reviewService.getReadySummary(productId);

        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }
    @GetMapping("/nextSummary/{productId}")
    public ResponseEntity<ProductReviewResponse> getNextSummary(
            @PathVariable Long productId,
            @RequestParam Long currentSummaryId) {

        ProductReviewResponse response = reviewService.getNextSummary(productId, currentSummaryId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/prevSummary/{productId}")
    public ResponseEntity<ProductReviewResponse> getPrevSummary(
            @PathVariable Long productId,
            @RequestParam Long currentSummaryId) {

        ProductReviewResponse response = reviewService.getPrevSummary(productId, currentSummaryId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }
    @PostMapping("/summary/{summaryId}/rate")
    public ResponseEntity<Map<String, Integer>> rateSummary(
            @PathVariable Long summaryId,
            @RequestBody Map<String, String> body) {

        String direction = body.get("direction");
        int updated = reviewService.updateUsefulness(summaryId, direction);
        return ResponseEntity.ok(Map.of("usefulness", updated));
    }


}

