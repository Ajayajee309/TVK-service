package com.example.backend.repository;

import com.example.backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findByCategory(String category);
    List<Complaint> findByPriority(String priority);
    List<Complaint> findByStatus(String status);
    
    // For counting stats
    long countByStatus(String status);
}
