package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.StatusUpdateRequest;
import com.example.backend.model.Admin;
import com.example.backend.model.Complaint;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.ComplaintRepository;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private ComplaintRepository complaintRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        // Seed an admin for first time use if empty (for demo purpose)
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername("ajay");
            admin.setPassword(passwordEncoder.encode("ajay@309"));
            adminRepository.save(admin);
        }

        Optional<Admin> adminOpt = adminRepository.findByUsername(loginRequest.getUsername());
        if (adminOpt.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), adminOpt.get().getPassword())) {
            String token = jwtUtil.generateToken(loginRequest.getUsername());
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    private boolean isAuthorized(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.validateToken(token);
        }
        return false;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", complaintRepository.count());
        stats.put("pending", complaintRepository.countByStatus("Pending"));
        stats.put("in_progress", complaintRepository.countByStatus("In Progress"));
        stats.put("resolved", complaintRepository.countByStatus("Resolved"));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Complaint> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody StatusUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAuthorized(authHeader))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Complaint updated = complaintService.updateComplaintStatus(id, request.getStatus(), request.getRemarks());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
