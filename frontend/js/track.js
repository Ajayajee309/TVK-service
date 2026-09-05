document.addEventListener('DOMContentLoaded', () => {
    const trackBtn = document.getElementById('trackBtn');
    const searchId = document.getElementById('searchId');
    const resultCard = document.getElementById('resultCard');
    const alertBox = document.getElementById('alertBox');

    trackBtn.addEventListener('click', async () => {
        const id = searchId.value.trim();
        if (!id) return;
        
        trackBtn.disabled = true;
        trackBtn.textContent = 'Searching...';
        alertBox.style.display = 'none';
        resultCard.style.display = 'none';
        
        try {
            const data = await trackComplaint(id);
            
            // Populate data
            document.getElementById('r_id').textContent = data.complaintId;
            document.getElementById('r_name').textContent = data.name;
            document.getElementById('r_category').textContent = data.category;
            document.getElementById('r_title').textContent = data.title;
            document.getElementById('r_location').textContent = `${data.street}, ${data.area}`;
            document.getElementById('r_priority').textContent = data.priority;
            document.getElementById('r_date').textContent = new Date(data.submittedDate).toLocaleString();
            
            const badge = document.getElementById('r_status_badge');
            badge.textContent = data.status;
            badge.className = 'status-badge ' + getStatusClass(data.status);
            
            // Timeline logic
            const timelineList = document.getElementById('timelineList');
            timelineList.innerHTML = '';
            
            const states = ['Pending', 'In Progress', 'Resolved'];
            let reachedCurrent = false;
            
            states.forEach(state => {
                const li = document.createElement('li');
                li.textContent = getTamilStatus(state);
                if (!reachedCurrent) {
                    li.className = `active-${state}`;
                }
                if (data.status === state) {
                    reachedCurrent = true;
                    li.className = `active-${state}`;
                    li.style.fontWeight = 'bold';
                }
                timelineList.appendChild(li);
            });

            const remarksBlock = document.getElementById('adminRemarksBlock');
            if (data.adminRemarks) {
                document.getElementById('r_remarks').textContent = data.adminRemarks;
                remarksBlock.style.display = 'block';
            } else {
                remarksBlock.style.display = 'none';
            }

            const feedbackBlock = document.getElementById('userFeedbackBlock');
            const feedbackResult = document.getElementById('userFeedbackResult');
            
            if (data.userFeedback) {
                document.getElementById('r_feedback').textContent = data.userFeedback;
                feedbackResult.style.display = 'block';
                feedbackBlock.style.display = 'none';
            } else if (data.status === 'Resolved') {
                feedbackBlock.style.display = 'block';
                feedbackResult.style.display = 'none';
            } else {
                feedbackBlock.style.display = 'none';
                feedbackResult.style.display = 'none';
            }

            resultCard.style.display = 'block';
            
        } catch (error) {
            alertBox.textContent = error.message === 'Complaint not found' ? '❌ Complaint ID not found.' : '❌ Error tracking complaint.';
            alertBox.className = 'alert alert-error';
            alertBox.style.display = 'block';
        } finally {
            trackBtn.disabled = false;
            trackBtn.textContent = 'Search';
        }
    });
    
    function getStatusClass(status) {
        if (status === 'Pending') return 'bg-pending';
        if (status === 'In Progress') return 'bg-inprogress';
        if (status === 'Resolved') return 'bg-resolved';
        return 'bg-pending';
    }
    
    function getTamilStatus(status) {
        if (status === 'Pending') return '🟡 புகார் பதிவு செய்யப்பட்டது / பரிசீலனையில் (Pending)';
        if (status === 'In Progress') return '🔵 நடவடிக்கை எடுக்கப்படுகிறது (In Progress)';
        if (status === 'Resolved') return '🟢 பிரச்சினை தீர்க்கப்பட்டது (Resolved)';
        return status;
    }
});

window.submitUserFeedback = async function(feedback) {
    const id = document.getElementById('searchId').value.trim();
    if (!id) return;
    try {
        const response = await fetch(`${API_BASE_URL}/complaints/track/${id}/feedback`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback: feedback })
        });
        if (response.ok) {
            document.getElementById('r_feedback').textContent = feedback;
            document.getElementById('userFeedbackResult').style.display = 'block';
            document.getElementById('userFeedbackBlock').style.display = 'none';
            alert('Your feedback has been submitted successfully! / உங்கள் பதில் பதிவு செய்யப்பட்டது!');
        } else {
            alert('Failed to submit feedback.');
        }
    } catch (e) {
        alert('Error submitting feedback.');
    }
};
