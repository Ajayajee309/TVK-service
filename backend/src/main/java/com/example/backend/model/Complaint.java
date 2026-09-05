package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
public class Complaint {

    @Id
    private String complaintId; // DGL-2026-000001

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String mobile;

    private String email;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String area;

    @Column(nullable = false)
    private String street;

    private String landmark;

    private String latitude;
    private String longitude;

    @Column(nullable = false)
    private String priority; // Normal, Medium, High, Emergency

    @Column(length = 2000)
    private String imageUrls; // Comma separated URLs

    @Column(nullable = false)
    private String status; // Pending, In Progress, Resolved

    @Column(length = 1000)
    private String adminRemarks;
    
    @Column(length = 50)
    private String userFeedback; // e.g. "Satisfied", "Not Satisfied"

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }

    public String getUserFeedback() {
        return userFeedback;
    }

    public void setUserFeedback(String userFeedback) {
        this.userFeedback = userFeedback;
    }

    @CreationTimestamp
    private LocalDateTime submittedDate;

    @UpdateTimestamp
    private LocalDateTime lastUpdatedDate;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = "Pending";
        }
    }
}
