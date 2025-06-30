package com.example.Market.Repositories;

import com.example.Market.Model.FinalSummary;
import com.example.Market.Model.ReviewSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewSummaryRepository extends JpaRepository<ReviewSummary, Long> {
    List<ReviewSummary> findByFinalSummary(FinalSummary finalSummary);
}
