package com.example.Market.Repositories;

import com.example.Market.Model.FinalSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinalSummaryRepository extends JpaRepository <FinalSummary, Long>
{

    List<FinalSummary> findByProductIdOrderByUsefulnessDesc(Long productId);
}
