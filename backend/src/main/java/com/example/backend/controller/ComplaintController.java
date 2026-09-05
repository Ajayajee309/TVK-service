package com.example.backend.controller;

import com.example.backend.model.Complaint;
import com.example.backend.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*") // Update this for production
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    // A simple local upload dir for demo purposes. 
    // Ideally this goes to Cloudinary or Firebase as requested, but we fallback to local here.
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<Complaint> submitComplaint(
            @ModelAttribute Complaint complaint, 
            @RequestParam(value = "images", required = false) MultipartFile[] files) {
        
        List<String> imageUrls = new ArrayList<>();
        
        if (files != null && files.length > 0) {
            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                        Path path = Paths.get(UPLOAD_DIR + fileName);
                        Files.write(path, file.getBytes());
                        imageUrls.add("/api/complaints/images/" + fileName);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
        if (!imageUrls.isEmpty()) {
            complaint.setImageUrls(String.join(",", imageUrls));
        }

        Complaint savedComplaint = complaintService.submitComplaint(complaint);
        return ResponseEntity.ok(savedComplaint);
    }

    @GetMapping("/track/{id}")
    public ResponseEntity<Complaint> trackComplaint(@PathVariable String id) {
        Complaint complaint = complaintService.getComplaint(id);
        if (complaint != null) {
            return ResponseEntity.ok(complaint);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/track/{id}/feedback")
    public ResponseEntity<?> submitFeedback(@PathVariable String id, @RequestBody java.util.Map<String, String> request) {
        try {
            Complaint updated = complaintService.updateUserFeedback(id, request.get("feedback"));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/images/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName) throws IOException {
        Path path = Paths.get(UPLOAD_DIR + fileName);
        if (Files.exists(path)) {
            byte[] imageBytes = Files.readAllBytes(path);
            return ResponseEntity.ok().header("Content-Type", Files.probeContentType(path)).body(imageBytes);
        }
        return ResponseEntity.notFound().build();
    }
}
