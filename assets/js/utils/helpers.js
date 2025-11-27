/**
 * Utility Helper Functions
 *
 * JSON-LD schemas, grid lines, donut charts, logo scroller
 *
 * Dependencies: core/data-loader.js
 * Exports: Multiple utility functions
 */

function generatePersonSchema(personData) {
    if (!personData) return null;

    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": personData.name,
        "jobTitle": personData.jobTitle,
        "description": personData.description,
        "url": personData.website,
        "image": personData.image,
        "email": personData.email,
        "telephone": personData.phone,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": personData.location.address,
            "addressLocality": personData.location.city,
            "addressRegion": personData.location.state,
            "postalCode": personData.location.zip,
            "addressCountry": personData.location.country
        },
        "sameAs": [
            personData.socialLinks.linkedin,
            personData.socialLinks.github,
            personData.socialLinks.dribbble,
            personData.socialLinks.instagram
        ],
        "knowsAbout": personData.skills
    };
}

function generateProjectSchema(projectData, personData) {
    if (!projectData || !personData) return null;

    return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": projectData.title,
        "description": projectData.description,
        "author": {
            "@type": "Person",
            "name": personData.name,
            "url": personData.website
        },
        "datePublished": projectData.year?.toString(),
        "image": `https://altazp.github.io/altaz-portfolio/assets/images/work/${projectData.id}-light.png`,
        "keywords": projectData.tags?.join(', '),
        "genre": projectData.category
    };
}

function generateBreadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

function generateWebSiteSchema(personData) {
    if (!personData) return null;

    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": `${personData.name} - Portfolio`,
        "url": personData.website,
        "description": personData.description,
        "author": {
            "@type": "Person",
            "name": personData.name
        }
    };
}

function injectJSONLD(schema) {
    if (!schema) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

function initJSONLDSchemas() {
    const personData = dataLoader.getPerson();
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();

    // Always inject Person schema on all pages
    injectJSONLD(generatePersonSchema(personData));

    // Inject appropriate schemas based on page
    if (currentPath.includes('/work/') || currentPath.includes('work/')) {
        // Project page
        const projectData = dataLoader.getProject(currentPage);
        if (projectData) {
            injectJSONLD(generateProjectSchema(projectData, personData));
            injectJSONLD(generateBreadcrumbSchema([
                { name: 'Home', url: 'https://altazp.github.io/altaz-portfolio/' },
                { name: 'Work', url: 'https://altazp.github.io/altaz-portfolio/#projects' },
                { name: projectData.title, url: `https://altazp.github.io/altaz-portfolio/work/${projectData.url}` }
            ]));
        }
    } else if (currentPage === 'index.html' || currentPath === '/' || currentPath === '') {
        // Homepage
        injectJSONLD(generateWebSiteSchema(personData));
    }
}

// Grid Lines System
// ==========================================

function toggleGridLines() {
    const overlay = document.getElementById('gridLinesOverlay');
    const toggle = document.getElementById('gridToggle');
    const toggleLocal = document.getElementById('gridToggleLocal');
    
    if (overlay) {
        overlay.classList.toggle('visible');
        
        // Update all grid toggles to stay in sync
        if (toggle) toggle.classList.toggle('active');
        if (toggleLocal) toggleLocal.classList.toggle('active');
        
        // Save state to localStorage
        const isVisible = overlay.classList.contains('visible');
        localStorage.setItem('gridLinesVisible', isVisible);
    }
}

function initGridLines() {
    const savedState = localStorage.getItem('gridLinesVisible');
    const overlay = document.getElementById('gridLinesOverlay');
    const toggle = document.getElementById('gridToggle');
    const toggleLocal = document.getElementById('gridToggleLocal');
    
    if (savedState === 'true' && overlay) {
        overlay.classList.add('visible');
        if (toggle) toggle.classList.add('active');
        if (toggleLocal) toggleLocal.classList.add('active');
    }
}


// Donut Chart Animations
// ==========================================

function initDonutCharts() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chart = entry.target;
                const progress = parseInt(chart.dataset.progress) || 0;
                const radius = 25; // SVG circle radius
                const circumference = 2 * Math.PI * radius;
                const progressLength = (progress / 100) * circumference;

                // Add animate class to trigger CSS animation
                chart.classList.add('animate');

                // Set the CSS custom property for the progress
                chart.style.setProperty('--progress', progressLength);

                // Animate the percentage number
                const valueElement = chart.querySelector('.chart-value');
                if (valueElement) {
                    animateChartValue(valueElement, 0, progress, 1500);
                }

                // Stop observing this chart
                observer.unobserve(chart);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -20px 0px'
    });

    // Observe all donut charts
    const charts = document.querySelectorAll('.donut-chart');
    charts.forEach(chart => {
        observer.observe(chart);
    });
}

function animateChartValue(element, start, end, duration) {
    const startTime = performance.now();

    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);

        element.textContent = current + '%';

        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }

    requestAnimationFrame(updateValue);
}


// Logo Scroller - Seamless Infinite Scroll
// ==========================================

// Global variable for brands scroll duration (milliseconds)
// Set to 40 seconds for smooth scrolling
let brandScrollDuration = 40000;
let restartLogoScroller = null; // Function to restart animation
let updateLogoScrollSpeed = null; // Function to update speed without resetting position

function initLogoScroller() {
    const track = document.querySelector('.logo-scroller-track');
    const scroller = document.querySelector('.logo-scroller');
    if (!track || !scroller) return;

    // Animation state
    let animationId = null;
    let position = 0;
    let isPaused = false;
    let scrollWidth = 0;
    let speed = 0;
    let lastTimestamp = null;

    // Calculate width of one complete set and scroll speed
    function calculateScrollParameters() {
        // Get all logos and filter for actually visible ones (not hidden by CSS)
        const allLogos = Array.from(track.querySelectorAll('.brand-logo'));
        const visibleLogos = allLogos.filter(logo => {
            return window.getComputedStyle(logo).display !== 'none';
        });

        if (visibleLogos.length === 0) {
            return; // No logos to scroll
        }

        // visibleLogos contains 2 sets (original + duplicate)
        // We need to calculate the width of exactly one set
        const oneSetCount = visibleLogos.length / 2;

        // Get computed gap between logos
        const trackStyles = window.getComputedStyle(track);
        const gap = parseInt(trackStyles.gap) || 64;

        // Calculate total width of one set
        // Measure using offsetLeft to get the exact distance between sets
        // This ensures perfect alignment when resetting
        const firstLogo = visibleLogos[0];
        const duplicateStartLogo = visibleLogos[oneSetCount];
        
        // Get offset positions (relative to track, not viewport)
        // Reset transform temporarily to get accurate measurements
        const savedTransform = track.style.transform;
        track.style.transform = 'translateX(0)';
        
        // Force a reflow to ensure layout is updated
        void track.offsetWidth;
        
        const firstOffset = firstLogo.offsetLeft;
        const duplicateOffset = duplicateStartLogo.offsetLeft;
        
        // Restore transform
        track.style.transform = savedTransform;
        
        // Calculate the exact distance between sets
        scrollWidth = duplicateOffset - firstOffset;
        
        // Fallback: if measurement fails or is invalid, calculate manually
        if (scrollWidth <= 0 || isNaN(scrollWidth) || !isFinite(scrollWidth)) {
        let totalWidth = 0;
        for (let i = 0; i < oneSetCount; i++) {
                totalWidth += visibleLogos[i].offsetWidth;
                if (i < oneSetCount - 1) {
                    totalWidth += gap;
        }
            }
        scrollWidth = totalWidth;
        }

        // Calculate speed using global brandScrollDuration variable
        speed = scrollWidth / brandScrollDuration; // pixels per millisecond
    }

    // Animation loop
    function animate(timestamp) {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        if (!isPaused && scrollWidth > 0) {
            // Calculate actual elapsed time since last frame
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // Move position based on speed and actual elapsed time
            position += speed * deltaTime;

            // Reset position when it reaches scrollWidth for seamless loop
            // Use a small epsilon to handle floating point precision issues
            const epsilon = 0.1;
            if (position >= scrollWidth - epsilon) {
                position = position - scrollWidth;
            }

            // Apply transform with sub-pixel precision
            track.style.transform = `translateX(-${position.toFixed(3)}px)`;
        } else if (isPaused) {
            // Don't update lastTimestamp when paused to prevent jump on resume
            lastTimestamp = timestamp;
        }

        // Continue animation loop
        animationId = requestAnimationFrame(animate);
    }

    // Pause on hover
    scroller.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    scroller.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    // Wait for all images to load before calculating
    function waitForImagesToLoad(callback) {
        const allLogos = Array.from(track.querySelectorAll('.brand-logo'));
        const visibleLogos = allLogos.filter(logo => {
            return window.getComputedStyle(logo).display !== 'none';
        });

        if (visibleLogos.length === 0) {
            callback();
            return;
        }

        // Check if all images are already loaded
        const allLoaded = visibleLogos.every(logo => 
            logo.complete && logo.naturalWidth > 0
        );

        if (allLoaded) {
            // Small delay to ensure layout is updated
            setTimeout(callback, 50);
            return;
        }

        let loadedCount = 0;
        const totalImages = visibleLogos.length;

        function checkComplete() {
            loadedCount++;
            if (loadedCount >= totalImages) {
                // Small delay to ensure layout is updated
                setTimeout(callback, 50);
            }
        }

        visibleLogos.forEach(logo => {
            if (logo.complete && logo.naturalWidth > 0) {
                checkComplete();
            } else {
                logo.addEventListener('load', checkComplete, { once: true });
                logo.addEventListener('error', checkComplete, { once: true });
            }
        });
    }

    // Setup and start animation
    function start() {
        // Cancel existing animation
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        // Reset position and timestamp
        position = 0;
        lastTimestamp = null;
        track.style.transform = 'translateX(0)';

        // Wait for images to load before calculating and starting
        waitForImagesToLoad(() => {
            // Calculate parameters after images are loaded
        calculateScrollParameters();

        // Start animation
        if (scrollWidth > 0) {
            animationId = requestAnimationFrame(animate);
        }
        });
    }

    // Update speed without resetting position (for smooth speed changes)
    function updateSpeed() {
        // Just recalculate the speed based on new duration
        // The animation loop will pick up the new speed automatically
        calculateScrollParameters();
    }

    // Expose functions globally
    restartLogoScroller = start;
    updateLogoScrollSpeed = updateSpeed;

    // Initial setup
    start();

    // Recalculate on theme change to ensure accuracy with different logo versions
    const observer = new MutationObserver(() => {
        start();
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // Recalculate on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(start, 150);
    });
}

