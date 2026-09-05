document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const form = document.getElementById('complaintForm');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('images');
    const imagePreview = document.getElementById('imagePreview');
    const btnLocation = document.getElementById('btnLocation');
    const locationStatus = document.getElementById('locationStatus');
    const alertBox = document.getElementById('alertBox');
    const categorySelect = document.getElementById('category');
    const otherCategoryBox = document.getElementById('otherCategoryBox');
    const otherCategoryInput = document.getElementById('otherCategory');

    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'மற்றவை / Others') {
                otherCategoryBox.style.display = 'block';
                otherCategoryInput.required = true;
            } else {
                otherCategoryBox.style.display = 'none';
                otherCategoryInput.required = false;
                otherCategoryInput.value = '';
            }
        });
    }
    // Location handling
    if (btnLocation) {
        btnLocation.addEventListener('click', () => {
            if ("geolocation" in navigator) {
                locationStatus.textContent = "Requesting location...";
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        document.getElementById('latitude').value = position.coords.latitude;
                        document.getElementById('longitude').value = position.coords.longitude;
                        locationStatus.textContent = "✅ Location captured automatically";
                        locationStatus.style.color = "green";
                    },
                    (error) => {
                        locationStatus.textContent = "❌ Error: Please allow location access or type address manually.";
                        locationStatus.style.color = "red";
                    }
                );
            } else {
                locationStatus.textContent = "Geolocation is not supported by your browser";
            }
        });
    }

    // Image Upload Area click
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Image preview
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            imagePreview.innerHTML = '';
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            
            const formData = new FormData(form);
            
            if (formData.get('category') === 'மற்றவை / Others') {
                formData.set('category', 'மற்றவை - ' + otherCategoryInput.value);
            }
            
            try {
                const response = await submitComplaint(formData);
                
                // Show success view
                form.style.display = 'none';
                const successView = document.getElementById('successView');
                document.getElementById('successComplaintId').textContent = response.complaintId;
                successView.style.display = 'block';
                window.scrollTo(0, 0);

            } catch (error) {
                alertBox.textContent = '❌ Error submitting complaint. Please try again.';
                alertBox.className = 'alert alert-error';
                alertBox.style.display = 'block';
                window.scrollTo(0, 0);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '📩 புகாரை பதிவு செய்யவும்';
            }
        });
    }
});
