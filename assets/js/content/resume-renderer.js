/**
 * Resume Content Rendering
 *
 * Generates experience timeline and skills grid
 *
 * Dependencies: core/data-loader.js
 * Exports: Resume rendering functions
 */

// Generate experience items for resume page
function initExperienceTimeline() {
    // Only run on resume page
    const timeline = document.querySelector('.experience-timeline');
    if (!timeline) return;

    // Clear existing content
    timeline.innerHTML = '';

    // Get experience data
    const experience = dataLoader.getExperience();
    if (experience.length === 0) return;

    // Separate featured and compact items
    const featured = experience.filter(exp => exp.featured);
    const compact = experience.filter(exp => !exp.featured);

    // Generate featured items
    featured.forEach(exp => {
        const div = document.createElement('div');
        div.className = 'experience-item experience-detailed';
        div.innerHTML = `
            <div class="experience-header">
                <div class="experience-dates">${exp.dates}</div>
                <div class="experience-company">${exp.company}</div>
                <div class="experience-location">${exp.location}</div>
                <h3 class="experience-title">${exp.title}</h3>
            </div>
            ${buildExperienceDescription(exp.description)}
        `;
        timeline.appendChild(div);
    });

    // Generate compact items grid
    if (compact.length > 0) {
        const gridDiv = document.createElement('div');
        gridDiv.className = 'experience-compact-grid';

        compact.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'experience-item experience-compact';
            div.innerHTML = `
                <div class="experience-header">
                    <div class="experience-dates">${exp.dates}</div>
                    <div class="experience-company">${exp.company}</div>
                    <div class="experience-location">${exp.location}</div>
                    <h3 class="experience-title">${exp.title}</h3>
                </div>
                ${buildExperienceDescription(exp.description)}
            `;
            gridDiv.appendChild(div);
        });

        timeline.appendChild(gridDiv);
    }
}

// Generate skills grid for resume page
function initSkillsGrid() {
    // Only run on resume page
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;

    // Clear existing content
    skillsGrid.innerHTML = '';

    // Get skills data
    const skills = dataLoader.getSkills();
    if (skills.length === 0) return;

    // Generate skill categories
    skills.forEach(category => {
        const div = document.createElement('div');
        div.className = 'skill-category';

        let skillsHTML = '';

        // Check if this category has skill levels (Development category)
        if (category.skillLevels) {
            const levels = Object.keys(category.skillLevels);
            skillsHTML = levels.map(level => {
                const skillsList = category.skillLevels[level].join(' / ');
                return `<span class="skill-level">${level}:</span> ${skillsList}`;
            }).join('<br>\n                        ');
        } else if (category.skills) {
            // Regular skills list
            skillsHTML = category.skills.join(' / ');
            if (category.description) {
                skillsHTML += `<br><br>\n                        ${category.description}`;
            }
        }

        div.innerHTML = `
            <h3 class="skill-category-title"><strong>${category.title}</strong></h3>
            <div class="skill-list">
                ${skillsHTML}
            </div>
        `;

        skillsGrid.appendChild(div);
    });
}

// Helpers
function buildExperienceDescription(description) {
    if (!description) return '';

    // Handle bullet arrays
    if (Array.isArray(description) && description.length > 0) {
        const items = description
            .map(point => `<li>${marked.parseInline(point)}</li>`)
            .join('');
        return `<ul class="experience-description-list">${items}</ul>`;
    }

    // Fallback to string paragraph
    return `<p class="experience-description">${marked.parseInline(description)}</p>`;
}

// ==========================================
