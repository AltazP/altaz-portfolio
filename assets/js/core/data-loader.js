/**
 * Data Loading System
 *
 * Centralized data management - loads content from JSON files
 *
 * Dependencies: None
 * Exports: DataLoader class, dataLoader instance
 */

class DataLoader {
    constructor() {
        this.data = {
            person: null,
            projects: null,
            experience: null,
            skills: null,
            brands: null,
            aboutCarousel: null,
            caseStudy: null
        };
        this.loaded = false;
        this.loadPromise = null;
        // Determine base path by inspecting how this script was loaded.
        // If the script tag uses "../" in its src attribute, we mirror that depth
        // when constructing the relative path to /data.
        const loaderScript = document.currentScript;
        let scriptSrc = loaderScript ? loaderScript.getAttribute('src') || '' : '';
        scriptSrc = scriptSrc.split('?')[0]; // Remove cache-busting query params
        const depthMatches = scriptSrc.match(/\.\.\//g);
        const depth = depthMatches ? depthMatches.length : 0;
        this.basePath = depth === 0 ? 'data/' : `${'../'.repeat(depth)}data/`;
    }

    async fetchJSON(path) {
        try {
            // Add cache-busting parameter
            const cacheBuster = new Date().getTime();
            const url = path.includes('?') ? `${path}&v=${cacheBuster}` : `${path}?v=${cacheBuster}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${path}:`, error);
            return null;
        }
    }

    async loadAll() {
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = Promise.all([
            this.fetchJSON(`${this.basePath}person.json`),
            this.fetchJSON(`${this.basePath}projects.json`),
            this.fetchJSON(`${this.basePath}experience.json`),
            this.fetchJSON(`${this.basePath}skills.json`),
            this.fetchJSON(`${this.basePath}brands.json`),
            this.fetchJSON(`${this.basePath}about-carousel.json`)
        ]).then(([person, projects, experience, skills, brands, aboutCarousel]) => {
            this.data.person = person;
            this.data.projects = projects?.projects || [];
            this.data.experience = experience?.experience || [];
            this.data.skills = skills?.skillCategories || [];
            this.data.brands = brands?.brands || [];
            this.data.aboutCarousel = aboutCarousel?.carouselCards || [];
            this.loaded = true;
            return this.data;
        });

        return this.loadPromise;
    }

    async loadCaseStudy(caseStudyId) {
        // Direct mapping - case study IDs match file names
        const path = `${this.basePath}case-studies/${caseStudyId}.json`;
        // Clear previous case study data to ensure fresh load
        this.data.caseStudy = null;
        this.data.caseStudy = await this.fetchJSON(path);
        return this.data.caseStudy;
    }

    getProjects() {
        return this.data.projects || [];
    }

    getProject(identifier) {
        const projects = this.getProjects();
        return projects.find(p => p.id === identifier || p.url === identifier);
    }

    getAdjacentProjects(identifier) {
        const projects = this.getProjects();
        const currentIndex = projects.findIndex(p => p.id === identifier || p.url === identifier);
        if (currentIndex === -1) return { prev: null, next: null };

        const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
        const nextIndex = (currentIndex + 1) % projects.length;

        return {
            prev: projects[prevIndex],
            next: projects[nextIndex]
        };
    }

    getPerson() {
        return this.data.person;
    }

    getExperience() {
        return this.data.experience;
    }

    getSkills() {
        return this.data.skills;
    }

    getBrands() {
        return this.data.brands;
    }

    getAboutCarousel() {
        return this.data.aboutCarousel;
    }

    getCaseStudy() {
        return this.data.caseStudy;
    }
}

// Create global instance
const dataLoader = new DataLoader();
