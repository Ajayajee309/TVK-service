package com.example.backend.service;

import com.example.backend.model.Complaint;
import com.example.backend.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public Complaint submitComplaint(Complaint complaint) {
        complaint.setComplaintId(generateComplaintId());
        return complaintRepository.save(complaint);
    }

    public Complaint getComplaint(String complaintId) {
        return complaintRepository.findById(complaintId).orElse(null);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Complaint updateComplaintStatus(String complaintId, String status, String remarks) {
        Complaint complaint = complaintRepository.findById(complaintId).orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(status);
        if (remarks != null && !remarks.isEmpty()) {
            complaint.setAdminRemarks(remarks);
        }
        return complaintRepository.save(complaint);
    }

    public Complaint updateUserFeedback(String complaintId, String feedback) {
        Complaint complaint = complaintRepository.findById(complaintId).orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setUserFeedback(feedback);
        return complaintRepository.save(complaint);
    }

    private synchronized String generateComplaintId() {
        String year = String.valueOf(Year.now().getValue());
        long count = complaintRepository.count() + 1;
        return String.format("DGL-%s-%06d", year, count);
    }
}
