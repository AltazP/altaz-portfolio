/**
 * Case Study Content Rendering
 *
 * Loads and renders case study content from JSON
 *
 * Dependencies: core/data-loader.js (uses marked.js for markdown)
 * Exports: Case study rendering functions
 */

// Case Study Content Rendering
// ==========================================

// Main initialization function for case study pages
async function initCaseStudyContent() {
    // Detect which case study page we're on
    const currentPath = window.location.pathname;
    let caseStudyId = null;

    if (currentPath.includes('strategy-tester')) {
        caseStudyId = 'strategy-tester';
    } else if (currentPath.includes('fbs-admin')) {
        caseStudyId = 'fbs-admin';
    } else if (currentPath.includes('nba-sim')) {
        caseStudyId = 'nba-sim';
    } else if (currentPath.includes('discrimination-rpg')) {
        caseStudyId = 'discrimination-rpg';
    }

    // Only run on case study pages
    if (!caseStudyId) return;

    // Load case study data
    try {
        // Load all data first (needed for project info)
        await dataLoader.loadAll();

        const caseStudy = await dataLoader.loadCaseStudy(caseStudyId);
        if (!caseStudy || !caseStudy.sections) {
            console.error('Failed to load case study data');
            return;
        }

        // Update page title and meta tags from project data
        const project = dataLoader.getProject(caseStudyId);
        if (project) {
            updatePageMeta(project);
        }

        // Render each section
        renderOverview(caseStudy.sections.overview);
        renderCoreTechnologies(caseStudy.sections.coreTechnologies);
        renderPurpose(caseStudy.sections.purpose);
        renderKeyFeatures(caseStudy.sections.keyFeatures);
        
        // Render results section only for fbs-admin and design-system (strategy-tester)
        if ((caseStudyId === 'fbs-admin' || caseStudyId === 'strategy-tester') && caseStudy.sections.results) {
        renderResults(caseStudy.sections.results);
        }

    } catch (error) {
        console.error('Error loading case study content:', error);
    }
}

// Update page title and meta tags from project data
function updatePageMeta(project) {
    if (!project) return;

    const pageTitle = `${project.title} - Altaz Punja`;

    // Update document title
    document.title = pageTitle;

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', pageTitle);

    // Update JSON-LD structured data
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
        try {
            const data = JSON.parse(jsonLd.textContent);
            data.name = `Building ${project.title.startsWith('a') || project.title.startsWith('an') ? project.title : 'a ' + project.title}`;
            data.about.name = `${project.title} Development`;
            jsonLd.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            console.error('Error updating JSON-LD:', e);
        }
    }
}

// Render overview section
function renderOverview(data) {
    if (!data) return;

    const section = document.getElementById('overview');
    if (!section) return;

    const heading = section.querySelector('h2');
    const contentDiv = section.querySelector('.section-content');

    if (heading) heading.textContent = data.heading;
    if (contentDiv && data.content) {
        contentDiv.innerHTML = marked.parse(data.content);
    }
}

// Render core technologies section
function renderCoreTechnologies(data) {
    if (!data) return;

    const section = document.getElementById('coreTechnologies');
    if (!section) return;

    const heading = section.querySelector('h2');
    const contentDiv = section.querySelector('.section-content');

    if (heading) heading.textContent = data.heading;

    if (contentDiv) {
        let html = '';

        // Add key points
        if (data.keyPoints && data.keyPoints.length > 0) {
            html += `
                <div class="challenge-highlight">
                    <ul>
                        ${data.keyPoints.map(point => `<li>${marked.parseInline(point)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        contentDiv.innerHTML = html;
    }
}

// Render purpose section
function renderPurpose(data) {
    if (!data) return;

    const section = document.getElementById('purpose');
    if (!section) return;

    const heading = section.querySelector('h2');
    const contentDiv = section.querySelector('.section-content');

    if (heading) heading.textContent = data.heading;

    if (contentDiv) {
        let html = '';

        // Add content
        if (data.content) {
            html += `<p>${marked.parseInline(data.content)}</p>`;
        }

        contentDiv.innerHTML = html;
    }
}

// Render key features section
function renderKeyFeatures(data) {
    if (!data) return;

    const section = document.getElementById('keyFeatures');
    if (!section) return;

    const heading = section.querySelector('h2');
    const contentDiv = section.querySelector('.section-content');

    if (heading) heading.textContent = data.heading;

    if (contentDiv) {
        let html = '';

        // Add process steps (same format as before)
        if (data.steps && data.steps.length > 0) {
            html += '<div class="process-steps">';
            data.steps.forEach(step => {
                html += `
                    <div class="process-step">
                        <div class="step-number">${step.number}</div>
                        <div class="step-content">
                            <h3>${step.title}</h3>
                            <p>${marked.parseInline(step.description)}</p>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        contentDiv.innerHTML = html;
    }
}

// Render results section
function renderResults(data) {
    if (!data) return;

    const section = document.getElementById('results');
    if (!section) return;

    const heading = section.querySelector('h2');
    const contentDiv = section.querySelector('.section-content');

    if (heading) heading.textContent = data.heading;

    if (contentDiv) {
        let html = '';

        // Add intro
        if (data.intro) {
            html += `<p class="results-intro">${marked.parseInline(data.intro)}</p>`;
        }

        // Add metrics based on type
        if (data.metrics && data.metrics.length > 0) {
            const metricsType = data.metricsType || 'chart';

            if (metricsType === 'simple') {
                // Simple metrics without charts
                html += '<div class="results-grid">';
                data.metrics.forEach(metric => {
                    html += `
                        <div class="result-metric">
                            <div class="metric-value">${metric.value}</div>
                            <div class="metric-label">${metric.label}</div>
                        </div>
                    `;
                });
                html += '</div>';
            } else if (metricsType === 'mixed') {
                // Mixed metrics with both charts and simple
                html += '<div class="results-grid">';
                data.metrics.forEach(metric => {
                    if (metric.type === 'simple' || !metric.chartProgress) {
                        html += `
                            <div class="result-metric">
                                <div class="metric-value">${metric.value}</div>
                                <div class="metric-label">${metric.label}</div>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="result-metric-chart">
                                <div class="donut-chart" data-progress="${metric.chartProgress}">
                                    <svg viewBox="0 0 60 60">
                                        <circle class="donut-track" cx="30" cy="30" r="25"></circle>
                                        <circle class="donut-fill" cx="30" cy="30" r="25"></circle>
                                    </svg>
                                    <div class="chart-center">
                                        <div class="chart-value">${metric.value}</div>
                                    </div>
                                </div>
                                <div class="chart-label">${metric.label}</div>
                            </div>
                        `;
                    }
                });
                html += '</div>';
            } else {
                // Standard donut chart metrics
                html += '<div class="results-grid">';
                data.metrics.forEach(metric => {
                    html += `
                        <div class="result-metric-chart">
                            <div class="donut-chart" data-progress="${metric.chartProgress}">
                                <svg viewBox="0 0 60 60">
                                    <circle class="donut-track" cx="30" cy="30" r="25"></circle>
                                    <circle class="donut-fill" cx="30" cy="30" r="25"></circle>
                                </svg>
                                <div class="chart-center">
                                    <div class="chart-value">${metric.value}</div>
                                </div>
                            </div>
                            <div class="chart-label">${metric.label}</div>
                        </div>
                    `;
                });
                html += '</div>';
            }
        }

        contentDiv.innerHTML = html;

        // Re-initialize donut charts after rendering
        if (typeof initDonutCharts === 'function') {
            initDonutCharts();
        }
    }
}


