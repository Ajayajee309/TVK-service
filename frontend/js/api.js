const API_BASE_URL = 'https://tvk-service.onrender.com/api';

async function submitComplaint(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'POST',
            body: formData // FormData handles multipart/form-data boundary automatically
        });
        if (!response.ok) throw new Error('Failed to submit complaint');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function trackComplaint(complaintId) {
    try {
        const response = await fetch(`${API_BASE_URL}/complaints/track/${complaintId}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Complaint not found');
            throw new Error('Failed to track complaint');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function adminLogin(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Invalid credentials');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function getAuthHeader() {
    const token = localStorage.getItem('adminToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers: getAuthHeader() });
    if (response.status === 401) throw new Error('Unauthorized');
    return await response.json();
}

async function getAllComplaints() {
    const response = await fetch(`${API_BASE_URL}/admin/complaints`, { headers: getAuthHeader() });
    if (response.status === 401) throw new Error('Unauthorized');
    return await response.json();
}

async function updateComplaintStatus(id, status, remarks) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify({ status, remarks })
    });
    if (response.status === 401) throw new Error('Unauthorized');
    return await response.json();
}
