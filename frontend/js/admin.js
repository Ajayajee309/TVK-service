document.addEventListener('DOMContentLoaded', () => {
    
    // LOGIN PAGE LOGIC
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            const alertBox = document.getElementById('alertBox');
            
            btn.disabled = true;
            btn.textContent = 'Logging in...';
            alertBox.style.display = 'none';
            
            try {
                const data = await adminLogin(u, p);
                localStorage.setItem('adminToken', data.token);
                window.location.href = 'admin-dashboard.html';
            } catch (error) {
                alertBox.textContent = '❌ Invalid credentials';
                alertBox.className = 'alert alert-error';
                alertBox.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }

    // DASHBOARD LOGIC
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        // Check token
        if (!localStorage.getItem('adminToken')) {
            window.location.href = 'admin-login.html';
            return;
        }

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });

        let allComplaints = [];

        async function loadDashboard() {
            try {
                // Load Stats
                const stats = await getDashboardStats();
                document.getElementById('statTotal').textContent = stats.total;
                document.getElementById('statPending').textContent = stats.pending;
                document.getElementById('statProgress').textContent = stats.in_progress;
                document.getElementById('statResolved').textContent = stats.resolved;

                // Load Table
                allComplaints = await getAllComplaints();
                renderTable(allComplaints);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    localStorage.removeItem('adminToken');
                    window.location.href = 'admin-login.html';
                }
            }
        }

        function renderTable(data) {
            tableBody.innerHTML = '';
            data.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${c.complaintId}</strong></td>
                    <td>${c.name}</td>
                    <td>${c.category}</td>
                    <td>${c.area}</td>
                    <td><span style="color: ${getPriorityColor(c.priority)}; font-weight: bold;">${c.priority}</span></td>
                    <td>${new Date(c.submittedDate).toLocaleDateString()}</td>
                    <td><span style="background: ${getStatusColor(c.status)}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">${c.status}</span></td>
                    <td><button class="action-btn btn-view" onclick="openModal('${c.complaintId}')">View</button></td>
                `;
                tableBody.appendChild(tr);
            });
        }

        function getPriorityColor(priority) {
            switch(priority) {
                case 'Emergency': return '#dc3545';
                case 'High': return '#fd7e14';
                case 'Medium': return '#ffc107';
                default: return '#28a745';
            }
        }

        function getStatusColor(status) {
            switch(status) {
                case 'Pending': return '#ffc107';
                case 'In Progress': return '#007bff';
                case 'Resolved': return '#28a745';
                default: return '#6c757d';
            }
        }

        // Filtering
        document.getElementById('filterSearch').addEventListener('input', applyFilters);
        document.getElementById('filterStatus').addEventListener('change', applyFilters);

        function applyFilters() {
            const term = document.getElementById('filterSearch').value.toLowerCase();
            const status = document.getElementById('filterStatus').value;
            
            const filtered = allComplaints.filter(c => {
                const matchTerm = c.complaintId.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
                const matchStatus = status ? c.status === status : true;
                return matchTerm && matchStatus;
            });
            renderTable(filtered);
        }
        
        // PDF Download (Using Browser Print to support Tamil fonts)
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                const term = document.getElementById('filterSearch').value.toLowerCase();
                const status = document.getElementById('filterStatus').value;
                const filtered = allComplaints.filter(c => {
                    const matchTerm = c.complaintId.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
                    const matchStatus = status ? c.status === status : true;
                    return matchTerm && matchStatus;
                });
                
                let printWindow = window.open('', '', 'width=1000,height=700');
                let html = `
                <html>
                <head>
                    <title>Complaints Report - Dindigul</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                        h2 { text-align: center; color: #dc3545; margin-bottom: 5px; }
                        p { text-align: center; font-size: 14px; color: #666; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #ffc107; color: #000; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        @media print {
                            @page { size: landscape; }
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <h2>Dindigul Public Complaint Portal - Report</h2>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Priority</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                filtered.forEach(c => {
                    html += `
                        <tr>
                            <td><strong>${c.complaintId}</strong></td>
                            <td>${c.name}</td>
                            <td>${c.mobile}</td>
                            <td>${c.category}</td>
                            <td>${c.street}, ${c.area}</td>
                            <td style="color: ${c.priority === 'Emergency' ? 'red' : 'black'};">${c.priority}</td>
                            <td>${new Date(c.submittedDate).toLocaleDateString()}</td>
                            <td><strong>${c.status}</strong></td>
                        </tr>
                    `;
                });

                html += `
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() { 
                            setTimeout(() => {
                                window.print(); 
                                window.close(); 
                            }, 500);
                        }
                    </script>
                </body>
                </html>
                `;

                printWindow.document.write(html);
                printWindow.document.close();
            });
        }

        // Modal Logic
        const modal = document.getElementById('complaintModal');
        const closeModal = document.querySelector('.close-modal');
        let currentComplaintId = null;

        closeModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        window.openModal = function(id) {
            currentComplaintId = id;
            const c = allComplaints.find(x => x.complaintId === id);
            if (!c) return;
            
            document.getElementById('m_id').textContent = c.complaintId;
            document.getElementById('m_name').textContent = c.name;
            document.getElementById('m_mobile').textContent = c.mobile;
            document.getElementById('m_priority').textContent = c.priority;
            document.getElementById('m_category').textContent = c.category;
            document.getElementById('m_location').textContent = `${c.street}, ${c.area}`;
            document.getElementById('m_title').textContent = c.title;
            document.getElementById('m_desc').textContent = c.description;
            
            document.getElementById('updateStatus').value = c.status;
            document.getElementById('updateRemarks').value = c.adminRemarks || '';
            document.getElementById('updateAlert').style.display = 'none';

            // User Feedback
            const feedbackContainer = document.getElementById('m_user_feedback_container');
            if (c.userFeedback) {
                document.getElementById('m_user_feedback').textContent = c.userFeedback;
                feedbackContainer.style.display = 'block';
                if (c.userFeedback.includes('Yes')) {
                    feedbackContainer.style.background = '#d4edda';
                    feedbackContainer.style.borderLeftColor = '#28a745';
                } else {
                    feedbackContainer.style.background = '#f8d7da';
                    feedbackContainer.style.borderLeftColor = '#dc3545';
                }
            } else {
                feedbackContainer.style.display = 'none';
            }

            // Location Link
            const mapLinkContainer = document.getElementById('m_map_link_container');
            if (c.latitude && c.longitude) {
                const mapLink = document.getElementById('m_map_link');
                mapLink.href = `https://www.google.com/maps?q=${c.latitude},${c.longitude}`;
                mapLinkContainer.style.display = 'block';
            } else {
                mapLinkContainer.style.display = 'none';
            }

            // Images
            const imgContainer = document.getElementById('m_images_container');
            const imgDiv = document.getElementById('m_images');
            imgDiv.innerHTML = '';
            if (c.imageUrls) {
                const urls = c.imageUrls.split(',');
                urls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = `http://localhost:8080${url}`;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    img.style.border = '1px solid #ddd';
                    img.onclick = () => window.open(img.src, '_blank');
                    img.style.cursor = 'pointer';
                    imgDiv.appendChild(img);
                });
                imgContainer.style.display = 'block';
            } else {
                imgContainer.style.display = 'none';
            }

            modal.style.display = 'block';
        }

        document.getElementById('saveUpdateBtn').addEventListener('click', async () => {
            if (!currentComplaintId) return;
            const status = document.getElementById('updateStatus').value;
            const remarks = document.getElementById('updateRemarks').value;
            const btn = document.getElementById('saveUpdateBtn');
            const alertBox = document.getElementById('updateAlert');
            
            btn.disabled = true;
            btn.textContent = 'Saving...';
            
            try {
                await updateComplaintStatus(currentComplaintId, status, remarks);
                alertBox.textContent = '✅ Updated successfully';
                alertBox.className = 'alert alert-success';
                alertBox.style.display = 'block';
                loadDashboard(); // Refresh data
                setTimeout(() => { modal.style.display = 'none'; }, 1500);
            } catch (error) {
                alertBox.textContent = '❌ Failed to update';
                alertBox.className = 'alert alert-error';
                alertBox.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Changes';
            }
        });

        loadDashboard();
    }
});
