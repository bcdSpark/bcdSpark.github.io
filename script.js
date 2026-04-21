(function() {
    'use strict';

    // Cache DOM elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const loadingIndicator = document.getElementById('loading-indicator');
    const galleryImages = document.querySelectorAll('.gallery-image');
    const navLinks = document.querySelectorAll('.nav-link');
    const yearSpan = document.getElementById('year');

    // Set current year in footer
    function setYear() {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Update year on initial load
    setYear();

    // Lazy loading with Intersection Observer
    function initLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            galleryImages.forEach(img => img.src = img.dataset.src || img.src);
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        galleryImages.forEach(img => {
            // Store original src for lightbox
            if (img.dataset.fullsize) {
                img.dataset.fullSrc = img.dataset.fullsize;
            }
            imageObserver.observe(img);
        });
    }

    // Show loading indicator
    function showLoading() {
        loadingIndicator.classList.add('active');
    }

    // Hide loading indicator
    function hideLoading() {
        loadingIndicator.classList.remove('active');
    }

    // Open lightbox
    function openLightbox(e) {
        const img = e.target.closest('.gallery-image') || e.target;
        const figure = img.closest('.gallery-item');
        
        if (!img || !figure) return;

        const fullSrc = img.dataset.fullSrc;
        const caption = figure.querySelector('.image-caption')?.textContent || '';

        if (!fullSrc) return;

        // Show loading indicator
        showLoading();
        lightbox.classList.remove('active');

        // Preload image
        const preloadImg = new Image();
        preloadImg.onload = function() {
            lightboxImage.src = fullSrc;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
            hideLoading();
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        };
        preloadImg.onerror = function() {
            hideLoading();
            alert('Failed to load image');
        };
        preloadImg.src = fullSrc;

        // Update aria-hidden
        lightbox.setAttribute('aria-hidden', 'false');
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxImage.src = '';
        lightboxCaption.textContent = '';
        document.body.style.overflow = '';
        lightbox.setAttribute('aria-hidden', 'true');
    }

    // Event Listeners
    lightboxClose.addEventListener('click', closeLightbox);

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Close on lightbox background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Gallery click handlers
    galleryImages.forEach(img => {
        img.addEventListener('click', openLightbox);
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Initialize lazy loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyLoading);
    } else {
        initLazyLoading();
    }

    // Performance: Prefetch lightbox images on hover
    galleryImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            if (this.dataset.fullSrc) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = this.dataset.fullSrc;
                document.head.appendChild(link);
                
                // Clean up after a short delay
                setTimeout(() => {
                    document.head.removeChild(link);
                }, 5000);
            }
        });
    });
})();