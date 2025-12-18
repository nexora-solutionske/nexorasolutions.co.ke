document.addEventListener('DOMContentLoaded', () => {
    // Select navigation elements
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    // Select preloader elements
    const preloader = document.getElementById('preloader');
    const scrollDownArrow = document.getElementById('scrollDownArrow');

    // --- Preloader and Page Transition Logic ---
    if (preloader && scrollDownArrow) {
        scrollDownArrow.addEventListener('click', () => {
            preloader.classList.add('hide-preloader');
            preloader.addEventListener('transitionend', () => {
                preloader.style.display = 'none';
                document.body.style.overflowY = 'auto'; // Re-enable scrolling
            }, { once: true });
        });
    } else {
        console.warn("Preloader elements not found. Ensuring body overflow is auto.");
        document.body.style.overflowY = 'auto';
        if (preloader) {
            preloader.style.display = 'none';
        }
    }

    // --- Mobile Navigation Toggle Logic ---
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
            navToggle.classList.toggle('nav-open');
        });

        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('nav-open')) {
                    mainNav.classList.remove('nav-open');
                    navToggle.classList.remove('nav-open');
                }
            });
        });
    }

    // --- Torchlight/Spotlight Effect for Services and Projects ---
    const illuminatedItems = document.querySelectorAll('.service-item, .portfolio-item');

    illuminatedItems.forEach(item => {
        const spotlight = document.createElement('div');
        spotlight.classList.add('spotlight');
        item.appendChild(spotlight);

        item.addEventListener('mousemove', (e) => {
            const itemRect = item.getBoundingClientRect();
            const x = e.clientX - itemRect.left;
            const y = e.clientY - itemRect.top;

            const fixedSpotlightRadius = '190px'; // Your desired radius for the clipped circle

            const greenishGoldenColors = `
                hsl(45, 100%, 85%, 0.8),
                hsl(55, 100%, 85%, 0.4),
                hsl(90, 100%, 80%, 0.4),
                hsl(140, 100%, 75%, 0.4),
                hsl(160, 100%, 75%, 0.4),
                hsl(120, 100%, 80%, 0.4),
                hsl(70, 100%, 85%, 0.4),
                hsl(45, 100%, 85%, 0.4)
            `;

            spotlight.style.backgroundImage = `linear-gradient(to bottom right, ${greenishGoldenColors})`;
            spotlight.style.clipPath = `circle(${fixedSpotlightRadius} at ${x}px ${y}px)`;
            spotlight.style.webkitClipPath = `circle(${fixedSpotlightRadius} at ${x}px ${y}px)`;
        });

        item.addEventListener('mouseleave', () => {
            spotlight.style.backgroundImage = 'none';
            spotlight.style.clipPath = 'none';
            spotlight.style.webkitClipPath = 'none';
        });
    });

    // --- Contact Form Submission Logic to use PHP Proxy ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // !!! IMPORTANT: This is the URL to your PHP proxy script, NOT the Discord webhook itself !!!
    const PHP_PROXY_URL = 'scripts/send_discord.php'; // Adjust path if send_discord.php is in a subfolder
    // Example: const PHP_PROXY_URL = '/api/send_discord.php';
    // !!! END IMPORTANT !!!

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            formStatus.textContent = 'Sending message...';
            formStatus.style.color = 'var(--text-dark)';

            // Get form field values
            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const subject = document.getElementById('subject')?.value.trim();
            const message = document.getElementById('message')?.value.trim();

            // Client-side validation: Check if required fields exist and are not empty
            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill in all required fields (Name, Email, Message).';
                formStatus.style.color = 'salmon';
                return;
            }

            // Prepare data to send to your PHP script
            const formData = {
                name: name,
                email: email,
                subject: subject,
                message: message
            };

            try {
                // Send the data to your PHP proxy script
                const response = await fetch(PHP_PROXY_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Tell PHP we're sending JSON
                    },
                    body: JSON.stringify(formData) // Convert JS object to JSON string
                });

                const result = await response.json(); // PHP script will return JSON

                if (response.ok && result.success) { // Check both HTTP status and PHP success flag
                    formStatus.textContent = 'Message sent successfully! Redirecting...';
                    formStatus.style.color = 'lightgreen';
                    contactForm.reset(); // Clear the form fields

                    setTimeout(() => {
                        window.location.href = '#hero';
                    }, 1500);
                } else {
                    // Handle server-side errors or failed API calls from PHP
                    console.error('Server Error:', result.message || 'Unknown server error');
                    formStatus.textContent = `Error: ${result.message || 'Something went wrong on the server.'}`;
                    formStatus.style.color = 'salmon';
                }
            } catch (error) {
                console.error('Fetch error:', error);
                formStatus.textContent = 'An unexpected network error occurred. Please try again.';
                formStatus.style.color = 'salmon';
            }
        });
    } else {
        console.warn("Contact form or form status element not found. Contact form submission will not work.");
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Get references to modal elements
    const galleryModal = document.getElementById('galleryModal');
    const galleryImage = document.getElementById('galleryImage');
    const galleryCaption = document.getElementById('galleryCaption');
    const closeBtn = document.querySelector('.gallery-close-btn');
    const prevBtn = document.querySelector('.gallery-nav-btn.prev-btn');
    const nextBtn = document.querySelector('.gallery-nav-btn.next-btn');

    // Select all buttons that should open the gallery
    const openGalleryButtons = document.querySelectorAll('.open-gallery-btn');

    let currentImages = []; // Array to hold image paths for the current project
    let currentImageIndex = 0; // Index of the currently displayed image

    // Function to display a specific image in the slideshow
    function showSlide(index) {
        // Handle wrapping around the image array
        if (index < 0) {
            currentImageIndex = currentImages.length - 1; // Go to last image
        } else if (index >= currentImages.length) {
            currentImageIndex = 0; // Go to first image
        } else {
            currentImageIndex = index; // Set to the requested index
        }
        galleryImage.src = currentImages[currentImageIndex]; // Update image source
    }

    // Add click listeners to all 'open-gallery-btn' elements
    openGalleryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default link behavior (e.g., navigating to #)

            // Get image paths and caption from data attributes
            const imagesData = button.getAttribute('data-images');
            const captionData = button.getAttribute('data-caption');

            if (imagesData) {
                // Split the comma-separated string into an array of image paths
                currentImages = imagesData.split(',').map(img => img.trim());
                currentImageIndex = 0; // Start with the first image
                galleryCaption.textContent = captionData || ''; // Set the caption, or empty if none

                showSlide(currentImageIndex); // Display the first image
                galleryModal.style.display = 'flex'; // Show the modal using flex for centering
                document.body.style.overflow = 'hidden'; // Prevent scrolling on the main page
            }
        });
    });

    // Add click listener to the close button
    closeBtn.addEventListener('click', () => {
        galleryModal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Re-enable scrolling on the main page
    });

    // Add click listener to close the modal when clicking outside the content
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) { // Check if the click was directly on the overlay
            galleryModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Add click listeners for navigation buttons
    prevBtn.addEventListener('click', () => {
        showSlide(currentImageIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        showSlide(currentImageIndex + 1);
    });

    // Optional: Keyboard navigation for accessibility and convenience
    document.addEventListener('keydown', (e) => {
        if (galleryModal.style.display === 'flex') { // Only active if the modal is open
            if (e.key === 'ArrowLeft') {
                showSlide(currentImageIndex - 1);
            } else if (e.key === 'ArrowRight') {
                showSlide(currentImageIndex + 1);
            } else if (e.key === 'Escape') {
                galleryModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
});