// ===== MVC ARCHITECTURE IMPLEMENTATION =====

// MODEL - Data and Business Logic
const ForensicModel = {
    // Current state
    currentSection: 'hero',
    
    // Data storage
    substances: {
        alcohol: {
            name: 'Etanol',
            formula: 'C₂H₅OH',
            molecularWeight: '46.07',
            boilingPoint: '78.37°C',
            description: 'Principal componente do álcool consumível'
        },
        cocaine: {
            name: 'Cocaína',
            formula: 'C₁₇H₂₁NO₄',
            molecularWeight: '303.35',
            meltingPoint: '98°C',
            description: 'Alcaloide extraído das folhas de coca'
        }
    },
    
    // Methods
    setCurrentSection(section) {
        this.currentSection = section;
        this.notifyObservers();
    },
    
    getCurrentSection() {
        return this.currentSection;
    },
    
    getSubstanceData(substanceId) {
        return this.substances[substanceId] || null;
    },
    
    // Observer pattern
    observers: [],
    
    addObserver(observer) {
        this.observers.push(observer);
    },
    
    notifyObservers() {
        this.observers.forEach(observer => observer.update(this.currentSection));
    }
};

// VIEW - User Interface Logic
const ForensicView = {
    // Elements
    sections: null,
    navLinks: null,
    
    // Initialize view
    init() {
        this.sections = document.querySelectorAll('.content-section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.setupEventListeners();
        this.initializeAnimations();
        this.initializeMoleculeAnimation();
    },
    
    // Show specific section
    showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Hide all sections
        this.sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        let targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            targetSection = document.getElementById(`${sectionId}-section`);
        }
        
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
            
            // Trigger AOS refresh for animations
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        } else {
            console.error('Section not found:', sectionId);
        }
        
        // Update navigation
        this.updateNavigation(sectionId);
    },
    
    // Update navigation active states
    updateNavigation(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Navigation clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                ForensicController.navigateToSection(section);
            });
        });
        
        // Hero button clicks
        const heroButtons = document.querySelectorAll('[data-section]');
        heroButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = button.getAttribute('data-section');
                if (section) {
                    ForensicController.navigateToSection(section);
                }
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ForensicController.navigateToSection('hero');
            }
        });
        
        // Scroll effects
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    // Handle scroll events
    handleScroll() {
        const navbar = document.querySelector('.custom-navbar');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update scroll indicator
        this.updateScrollIndicator();
    },
    
    // Update scroll progress indicator
    updateScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollIndicator.style.transform = `scaleX(${scrollPercent / 100})`;
        }
    },
    
    // Handle window resize
    handleResize() {
        if (this.moleculeRenderer) {
            this.moleculeRenderer.handleResize();
        }
    },
    
    // Initialize animations
    initializeAnimations() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100
            });
        }
        
        // Add pulse animation to icons
        const icons = document.querySelectorAll('.substance-icon');
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.classList.add('pulse-animation');
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.classList.remove('pulse-animation');
            });
        });
    },
    
    // Initialize 3D molecule animation
    initializeMoleculeAnimation() {
        const canvas = document.getElementById('molecule-canvas');
        if (canvas && typeof THREE !== 'undefined') {
            this.moleculeRenderer = new MoleculeRenderer(canvas);
            this.moleculeRenderer.init();
        }
    },
    
    // Show loading state
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
        }
    },
    
    // Hide loading state
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
        }
    },
    
    // Observer pattern update method
    update(currentSection) {
        this.showSection(currentSection);
    }
};

// CONTROLLER - Application Logic
const ForensicController = {
    // Initialize application
    init() {
        // Inicializa a view primeiro
        ForensicView.init();
        
        // Adiciona a view como observador do modelo
        ForensicModel.addObserver(ForensicView);
        
        // Configura o roteamento
        this.setupRouting();
        
        // Melhoria: Adiciona carregamento preguiçoso (lazy loading) para imagens
        this.setupLazyLoading();
        
        console.log('Forensic Chemistry App initialized successfully');
    },
    
    // Configuração do lazy loading para imagens
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    // Navigate to section
    navigateToSection(sectionId) {
        if (this.isValidSection(sectionId)) {
            ForensicModel.setCurrentSection(sectionId);
            this.updateURL(sectionId);
        }
    },
    
   // Adicione esta linha na função isValidSection do Controller:
    isValidSection(sectionId) {
    const validSections = ['hero', 'methodology', 'alcohol', 'cocaine', 'blood', 'drugs', 'additional-substances'];
    return validSections.includes(sectionId);
    },
    
    // Setup URL routing
    setupRouting() {
        // Handle initial URL
        const hash = window.location.hash.replace('#', '');
        if (hash && this.isValidSection(hash)) {
            this.navigateToSection(hash);
        }
        
        // Handle browser navigation
        window.addEventListener('popstate', (e) => {
            const hash = window.location.hash.replace('#', '') || 'hero';
            if (this.isValidSection(hash)) {
                ForensicModel.setCurrentSection(hash);
            }
        });
    },
    
    // Update URL
    updateURL(sectionId) {
        if (sectionId !== 'hero') {
            window.history.pushState({}, '', `#${sectionId}`);
        } else {
            window.history.pushState({}, '', window.location.pathname);
        }
    },
    
    // Get substance data
    getSubstanceInfo(substanceId) {
        return ForensicModel.getSubstanceData(substanceId);
    }
};

// ===== 3D MOLECULE RENDERER =====
class MoleculeRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.molecules = [];
        this.animationId = null;
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.createMolecules();
        this.setupLighting();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0f0f23, 10, 50);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 20;
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Point light
        const pointLight = new THREE.PointLight(0xff6b6b, 0.5, 30);
        pointLight.position.set(-10, -10, 10);
        this.scene.add(pointLight);
    }
    
    createMolecules() {
        const moleculeCount = 15;
        
        for (let i = 0; i < moleculeCount; i++) {
            const molecule = this.createMolecule();
            this.molecules.push(molecule);
            this.scene.add(molecule.group);
        }
    }
    
    createMolecule() {
        const group = new THREE.Group();
        
        // Create atoms (spheres)
        const atomGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const atomCount = Math.floor(Math.random() * 6) + 3;
        const atoms = [];
        
        for (let i = 0; i < atomCount; i++) {
            const atomMaterial = new THREE.MeshPhongMaterial({
                color: this.getRandomAtomColor(),
                transparent: true,
                opacity: 0.8
            });
            
            const atom = new THREE.Mesh(atomGeometry, atomMaterial);
            atom.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            
            atoms.push(atom);
            group.add(atom);
        }
        
        // Create bonds (lines)
        for (let i = 0; i < atoms.length - 1; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                atoms[i].position,
                atoms[i + 1].position
            ]);
            
            const material = new THREE.LineBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.6
            });
            
            const bond = new THREE.Line(geometry, material);
            group.add(bond);
        }
        
        // Position the molecule
        group.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40
        );
        
        return {
            group: group,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            }
        };
    }
    
    getRandomAtomColor() {
        const colors = [0x00d4ff, 0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Rotate molecules
        this.molecules.forEach(molecule => {
            molecule.group.rotation.x += molecule.rotationSpeed.x;
            molecule.group.rotation.y += molecule.rotationSpeed.y;
            molecule.group.rotation.z += molecule.rotationSpeed.z;
        });
        
        // Camera movement
        const time = Date.now() * 0.0005;
        this.camera.position.x = Math.cos(time) * 0.5;
        this.camera.position.y = Math.sin(time * 0.7) * 0.5;
        this.camera.lookAt(this.scene.position);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js resources
        this.molecules.forEach(molecule => {
            molecule.group.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Debounce function
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Format chemical formula
    formatFormula(formula) {
        return formula.replace(/(\d+)/g, '<sub>$1</sub>');
    },
    
    // Animate number counting
    animateNumber(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (difference * progress);
            
            element.textContent = Math.floor(current);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        
        requestAnimationFrame(step);
    }
};

// ===== INITIALIZATION =====
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    ForensicController.init();
    
    // Create scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);
    
    // Initialize particles background (optional)
    if (typeof particlesJS !== 'undefined') {
        particlesJS('molecule-canvas', {
            particles: {
                number: { value: 50 },
                color: { value: '#00d4ff' },
                shape: { type: 'circle' },
                opacity: { value: 0.3 },
                size: { value: 3 },
                move: { enable: true, speed: 1 }
            }
        });
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        console.log('Page hidden - pausing animations');
    } else {
        // Resume animations when tab becomes visible
        console.log('Page visible - resuming animations');
    }
});

// Export for global access (KISS principle)
window.ForensicApp = {
    Model: ForensicModel,
    View: ForensicView,
    Controller: ForensicController,
    Utils: Utils
};