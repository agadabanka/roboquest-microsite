/*
ROBOQUEST MICROSITE JAVASCRIPT
Interactive elements and mobile optimization
Based on UX research recommendations
*/

// ===== MOBILE NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .gallery-item, .social-link, .press-item').forEach(el => {
    observer.observe(el);
});

// ===== GALLERY INTERACTIONS =====
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('.gallery-img');
        const overlay = this.querySelector('.gallery-overlay');
        
        // Create modal or lightbox effect (simplified)
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <img src="${img.src}" alt="${img.alt}" class="modal-image">
                    <button class="modal-close">&times;</button>
                    <p class="modal-caption">${overlay.querySelector('p').textContent}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.modal-close').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-backdrop').addEventListener('click', function(e) {
            if (e.target === this) {
                document.body.removeChild(modal);
            }
        });
    });
});

// ===== NEWSLETTER FORM HANDLING =====
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = this.querySelector('.email-input');
    const submitBtn = this.querySelector('.btn');
    const email = emailInput.value;
    
    if (email && isValidEmail(email)) {
        // Simulate form submission
        submitBtn.textContent = 'Joining...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = '✅ Joined!';
            submitBtn.style.background = 'var(--success-green)';
            emailInput.value = '';
            
            setTimeout(() => {
                submitBtn.textContent = 'Join Adventure';
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }, 1000);
        
        // Here you would integrate with your email service (Mailchimp, ConvertKit, etc.)
        console.log('Newsletter signup:', email);
    } else {
        emailInput.style.borderColor = 'var(--warning-orange)';
        emailInput.placeholder = 'Please enter a valid email';
        
        setTimeout(() => {
            emailInput.style.borderColor = '';
            emailInput.placeholder = 'Enter your email';
        }, 3000);
    }
});

// ===== EMAIL VALIDATION =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== DOWNLOAD BUTTON TRACKING =====
document.querySelectorAll('.download-btn, .btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Track download button clicks for analytics
        const platform = this.classList.contains('ios') ? 'iOS' : 
                         this.classList.contains('android') ? 'Android' : 'General';
        
        console.log('Download button clicked:', platform);
        
        // Here you would integrate with your analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'Download',
                event_label: platform,
                value: 1
            });
        }
        
        // Add visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// ===== SOCIAL MEDIA TRACKING =====
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const platform = this.classList.contains('discord') ? 'Discord' :
                         this.classList.contains('twitter') ? 'Twitter' :
                         this.classList.contains('youtube') ? 'YouTube' :
                         this.classList.contains('reddit') ? 'Reddit' : 'Unknown';
        
        console.log('Social link clicked:', platform);
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'Social',
                event_label: platform,
                value: 1
            });
        }
    });
});

// ===== PERFORMANCE OPTIMIZATIONS =====

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
lazyLoadImages();

// ===== SCROLL TO TOP FUNCTIONALITY =====
function createScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-blue);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        transition: var(--transition-medium);
        z-index: 1000;
        box-shadow: var(--shadow-medium);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide scroll button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
        } else {
            scrollBtn.style.opacity = '0';
        }
    });
    
    // Scroll to top functionality
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top
createScrollToTop();

// ===== DYNAMIC CONTENT LOADING =====
function loadDynamicContent() {
    // This could be used to load game stats, community numbers, etc.
    // For now, we'll simulate some dynamic updates
    
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const finalValue = stat.textContent;
        if (!isNaN(finalValue)) {
            let currentValue = 0;
            const increment = finalValue / 50;
            
            const updateCounter = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(updateCounter);
                }
                stat.textContent = Math.floor(currentValue);
            }, 50);
        }
    });
}

// ===== MODAL STYLES (for gallery) =====
const modalStyles = `
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
}

.modal-backdrop {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
}

.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    text-align: center;
}

.modal-image {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-close {
    position: absolute;
    top: -40px;
    right: -10px;
    background: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-dark);
    transition: var(--transition-fast);
}

.modal-close:hover {
    background: var(--accent-orange);
    color: white;
}

.modal-caption {
    color: white;
    margin-top: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
}

@media (max-width: 768px) {
    .modal-backdrop {
        padding: 1rem;
    }
    
    .modal-close {
        top: -30px;
        right: 0;
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
    }
}
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// ===== INITIALIZE ALL FUNCTIONALITY =====
window.addEventListener('load', function() {
    // Trigger animations for elements in view
    const elementsToAnimate = document.querySelectorAll('.feature-card, .story-point');
    elementsToAnimate.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('fade-in');
        }, index * 100);
    });
    
    // Load dynamic content after page load
    setTimeout(loadDynamicContent, 500);
    
    console.log('🎮 RoboQuest microsite loaded successfully!');
});

// ===== CONTACT FORM HANDLING (for press inquiries) =====
function handleContactForm() {
    // This would integrate with your contact form service
    // For now, it's a placeholder for future implementation
    console.log('Contact form functionality ready for integration');
}

// ===== ANALYTICS INTEGRATION HELPERS =====
function trackEvent(category, action, label, value) {
    // Google Analytics tracking helper
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    // Custom analytics can be added here
    console.log('Event tracked:', { category, action, label, value });
}

// ===== DEVICE DETECTION FOR OPTIMIZATION =====
function detectDevice() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    // Add device classes for CSS targeting
    document.body.classList.add(isMobile ? 'mobile' : 'desktop');
    if (isTablet) document.body.classList.add('tablet');
    
    return { isMobile, isTablet };
}

// Initialize device detection
const device = detectDevice();

// Update device classes on resize
window.addEventListener('resize', function() {
    document.body.classList.remove('mobile', 'desktop', 'tablet');
    detectDevice();
});

// ===== PERFORMANCE MONITORING =====
function monitorPerformance() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
        
        // Track performance for analytics
        trackEvent('Performance', 'page_load_time', 'milliseconds', loadTime);
    });
}

// Initialize performance monitoring
monitorPerformance();

// ===== EASTER EGGS (for engagement) =====
let clickCount = 0;
document.querySelector('.hero-robot')?.addEventListener('click', function() {
    clickCount++;
    
    if (clickCount === 5) {
        this.style.animation = 'pulse 0.5s ease';
        console.log('🤖 Robo says: Thanks for clicking! The adventure awaits!');
        
        // Reset animation
        setTimeout(() => {
            this.style.animation = 'float 3s ease-in-out infinite';
            clickCount = 0;
        }, 500);
    }
});

// ===== FLOATING COINS INTERACTION =====
document.querySelectorAll('.floating-coin').forEach(coin => {
    coin.addEventListener('click', function() {
        this.style.animation = 'none';
        this.style.transform = 'scale(1.5) rotate(360deg)';
        this.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            this.style.transform = '';
            this.style.animation = 'float 2s ease-in-out infinite';
        }, 500);
        
        trackEvent('Engagement', 'coin_click', 'hero_section', 1);
    });
});

// ===== FEATURE CARD INTERACTIONS =====
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.feature-icon');
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.feature-icon');
        icon.style.transform = '';
    });
});

// ===== SOCIAL MEDIA SHARE FUNCTIONALITY =====
function sharePage(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Check out RoboQuest - A charming 3D platformer adventure!');
    
    let shareUrl;
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'reddit':
            shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    trackEvent('Social', 'share', platform, 1);
}

// ===== LOADING OPTIMIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Preload critical images
    const criticalImages = [
        './images/hero-robot.png',
        './images/logo.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// ===== ACCESSIBILITY ENHANCEMENTS =====
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        document.querySelector('.hamburger').classList.remove('active');
        document.querySelector('.nav-menu').classList.remove('active');
    }
    
    // Tab navigation enhancements
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('using-keyboard');
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.warn('JavaScript error caught:', e.error);
    // In production, this could report to error tracking service
});

// ===== CONSOLE WELCOME MESSAGE =====
console.log(`
🎮 Welcome to RoboQuest Microsite!
🤖 Built with love for indie gaming
📱 Optimized for mobile-first experience
🚀 Ready for adventure!
`);

// Export functions for external use
window.RoboQuest = {
    trackEvent,
    sharePage,
    device
};