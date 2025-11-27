/**
 * UX Portfolio - Main Initialization
 *
 * This is the main initialization file for the modular portfolio system.
 * All functionality has been split into organized modules for maintainability.
 *
 * Module Architecture:
 * - core/: Core systems (data loading, theme, config)
 * - components/: Interactive components (carousels, navigation, menus)
 * - content/: Content renderers (projects, brands, resume, case studies)
 * - utils/: Utility functions (animations, image preloading, helpers)
 *
 * Load Order (see HTML):
 * 1. Core modules (config, data-loader, theme-system)
 * 2. Utilities (helpers, animations, image-preloader)
 * 3. Components (navigation, mobile-menu, logo-animation, carousel-base)
 * 4. Specific implementations (carousel-about, carousel-project, carousel-featured)
 * 5. Content renderers (project, carousel, brand, resume, case-study)
 * 6. This file (main.js) - initialization orchestration
 */

// ==========================================
// Main Initialization Sequence
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
    // Load all data from JSON files first
    try {
        await dataLoader.loadAll();
        console.log('Data loaded successfully');

        // Inject JSON-LD schemas for SEO
        initJSONLDSchemas();
    } catch (error) {
        console.error('Error loading data:', error);
        // Continue with fallback data from PROJECTS array
    }

    // Core system initialization
    initTheme();
    initGridLines();
    initLogoLetterAnimation();

    // Dynamic content generation - must run BEFORE scroll animations
    initProjectCards(); // Generate project cards on index page
    initProjectPageContent(); // Update page title and subtitle on project pages
    initProjectNavigation(); // Update prev/next navigation on project pages
    initBrandLogos(); // Generate brand logos from JSON
    initAboutCarousel(); // Generate about carousel cards from JSON
    initAboutCarouselIndicators(); // Generate about carousel indicators from JSON
    initExperienceTimeline(); // Generate experience timeline for resume page
    initSkillsGrid(); // Generate skills grid for resume page
    initHoverPreloading(); // Initialize hover intent image preloading
    await initCaseStudyContent(); // Load and render case study content from JSON

    // Interactive features initialization
    initScrollAnimations(); // Now project cards exist and can be observed
    initSmoothScrolling();
    initBackToTop(); // Show/hide back-to-top buttons on scroll
    initMobileMenuClose();
    initCarousel(); // About carousel
    initProjectCarousels(); // Project and featured carousels
    initLogoColorChange();
    initNavigationActiveState();
    initProjectNavigationActiveState();
    initStickyProjectNav();
    initPageTransitions();
    initDonutCharts();

    // Initialize particle system (only on index page with hero section)
    if (typeof initParticleSystem === 'function') {
        initParticleSystem();
    }

    // Initialize logo scroller (must run AFTER initBrandLogos)
    initLogoScroller();

    // Disable browser scroll restoration to prevent unwanted scroll on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Handle hash navigation after everything is loaded and rendered
    // Only scroll to hash on explicit navigation (navigate type), not on page refresh
    if (window.location.hash) {
        // Check if this is a page refresh/reload
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        const isPageRefresh = navigationEntry && navigationEntry.type === 'reload';
        
        // Only scroll to hash if it's NOT a page refresh
        // This ensures refreshing always starts at the top
        if (!isPageRefresh) {
            // Wait for layout to fully settle
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'instant', block: 'start' });
                }
            }, 300); // Longer delay ensures all content above is laid out
        } else {
            // On refresh, always scroll to top
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    } else {
        // No hash - ensure we're at the top on page load
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});

// Handle browser back/forward navigation and page cache
window.addEventListener('pageshow', async function(event) {
    // If page was loaded from cache (back/forward navigation)
    if (event.persisted) {
        // Re-initialize case study content
        if (typeof initCaseStudyContent === 'function') {
            await initCaseStudyContent();
        }
        
        // Re-initialize project page content
        if (typeof initProjectPageContent === 'function') {
            initProjectPageContent();
        }
        
        // Re-initialize project navigation
        if (typeof initProjectNavigation === 'function') {
            initProjectNavigation();
        }
        
        // Re-initialize project carousels
        if (typeof initProjectCarousels === 'function') {
            initProjectCarousels();
        }
        
        // Re-initialize theme responsive images
        if (typeof updateThemeResponsiveImages === 'function') {
            updateThemeResponsiveImages();
        }
        
        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});

// Also handle popstate for additional navigation events
window.addEventListener('popstate', async function() {
    // Small delay to ensure page is ready
    setTimeout(async () => {
        // Re-initialize case study content when navigating back/forward
        if (typeof initCaseStudyContent === 'function') {
            await initCaseStudyContent();
        }
        
        // Re-initialize project page content
        if (typeof initProjectPageContent === 'function') {
            initProjectPageContent();
        }
        
        // Re-initialize project navigation
        if (typeof initProjectNavigation === 'function') {
            initProjectNavigation();
        }
        
        // Re-initialize project carousels
        if (typeof initProjectCarousels === 'function') {
            initProjectCarousels();
        }
    }, 100);
});
