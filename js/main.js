/**
 * VESPERA JEWELS - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // Navigation
    // ============================================
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Scroll handler for navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('open');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link-mobile').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('open');
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // ============================================
    // Product Filtering (Jewelry)
    // ============================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            productCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden-category');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden-category');
                }
            });
        });
    });
    
    // ============================================
    // FAQ Accordion
    // ============================================
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.faq-item.active').forEach(activeItem => {
                activeItem.classList.remove('active');
                activeItem.querySelector('.faq-answer').classList.add('hidden');
            });
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
                item.querySelector('.faq-answer').classList.remove('hidden');
            }
        });
    });
    
    // ============================================
    // Contact Form
    // ============================================
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            if (name && email && message) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address.');
                    return;
                }
                
                // Log form data (in production, send to server)
                console.log('Form submitted:', { name, email, message });
                
                // Show success
                contactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
                formSuccess.classList.add('visible');
                
                // Reset after delay
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.classList.remove('hidden');
                    formSuccess.classList.add('hidden');
                    formSuccess.classList.remove('visible');
                }, 5000);
            }
        });
    }
    
    // ============================================
    // Product Modal
    // ============================================
    const productModal = document.getElementById('productModal');
    
    // Dynamic product data storage
    let dynamicProducts = {
        featured: [],
        jewelry: [],
        watch: []
    };

    // Simple frontmatter parser for markdown
    function parseFrontmatter(text) {
        const result = {};
        const lines = text.split('\n');
        let inFrontmatter = false;

        for (const line of lines) {
            if (line.trim() === '---') {
                if (inFrontmatter) {
                    break;
                }
                inFrontmatter = true;
                continue;
            }

            if (inFrontmatter && line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                result[key] = value;
            }
        }

        return result;
    }

    // Load products from JSON files (new CMS format)
    async function loadProducts() {
        try {
            // Load jewelry products from products-index.json
            try {
                const jewelryResponse = await fetch('content/jewelry/products-index.json');
                if (jewelryResponse.ok) {
                    const jewelryData = await jewelryResponse.json();
                    if (Array.isArray(jewelryData)) {
                        // Filter out unpublished products and sort by order
                        dynamicProducts.jewelry = jewelryData
                            .filter(item => item.published !== false && item.published !== 'false')
                            .sort((a, b) => (a.order || 999) - (b.order || 999))
                            .map((item, index) => ({
                                name: item.name || '',
                                price: item.price || '',
                                desc: item.description || '',
                                category: item.category ? item.category.toLowerCase() : '',
                                categoryDisplay: item.category ? item.category.toUpperCase() : '',
                                image: convertImagePath(item.images?.[0] || item.image || ''),
                                images: (item.images || (item.image ? [item.image] : [])).map(img => convertImagePath(img)),
                                badge: item.badge || '',
                                order: item.order || 999
                            }));
                    }
                }
            } catch (e) {
                console.log('Failed to load jewelry products from JSON:', e.message);
                dynamicProducts.jewelry = [];
            }

            // Load watch products from products-index.json
            try {
                const watchResponse = await fetch('content/watches/products-index.json');
                if (watchResponse.ok) {
                    const watchData = await watchResponse.json();
                    if (Array.isArray(watchData)) {
                        // Filter out unpublished products and sort by order
                        dynamicProducts.watch = watchData
                            .filter(item => item.published !== false && item.published !== 'false')
                            .sort((a, b) => (a.order || 999) - (b.order || 999))
                            .map((item) => ({
                                name: item.name || '',
                                price: item.price || '',
                                desc: item.description || '',
                                category: item.category || '',
                                image: convertImagePath(item.image || (item.images?.[0] || '')),
                                images: (item.images || (item.image ? [item.image] : [])).map(img => convertImagePath(img)),
                                badge: item.badge || ''
                            }));
                    }
                }
            } catch (e) {
                console.log('Failed to load watch products from JSON:', e.message);
                dynamicProducts.watch = [];
            }

            // Featured products = first 4 from jewelry
            if (dynamicProducts.jewelry.length > 0) {
                dynamicProducts.featured = dynamicProducts.jewelry.slice(0, 4);
            }

            console.log('Products loaded from JSON:', dynamicProducts);
            
            // Update product cards on page with dynamic data
            updateProductCards();
            
        } catch (e) {
            console.log('Using default product data:', e.message);
        }
    }

    // Convert relative image paths to GitHub raw URLs
    function convertImagePath(imagePath) {
        if (!imagePath) return '';
        
        // If it's already an http URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If it's a relative path starting with /, convert to GitHub raw URL
        if (imagePath.startsWith('/')) {
            return `https://raw.githubusercontent.com/leejackma/vesperajewels/main${imagePath}`;
        }
        
        return imagePath;
    }

    // Update product cards on the page with dynamic data from JSON
    function updateProductCards() {
        // Update Jewelry cards
        const jewelryGrid = document.getElementById('jewelryGrid');
        if (jewelryGrid) {
            if (dynamicProducts.jewelry && dynamicProducts.jewelry.length > 0) {
                const placeholderImg = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';
                
                let html = '';
                dynamicProducts.jewelry.forEach((product, index) => {
                    const imgSrc = product.image || placeholderImg;
                    const categoryDisplay = product.categoryDisplay || (product.category ? product.category.toUpperCase() : '');
                    
                    html += `
                        <div class="product-card animate-on-scroll cursor-pointer" data-category="${escapeHtml(product.category)}" onclick="openProductModal('jewelry', ${index})">
                            <div class="relative overflow-hidden group">
                                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" class="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105">
                                ${categoryDisplay ? `<div class="absolute top-3 left-3">
                                    <span class="bg-[#C5A467] text-white text-xs px-2 py-1">${escapeHtml(categoryDisplay)}</span>
                                </div>` : ''}
                            </div>
                            <div class="p-4">
                                <h3 class="font-playfair text-lg text-[#1a1a1a]">${escapeHtml(product.name)}</h3>
                                <p class="text-sm text-gray-500 mt-1">${escapeHtml(product.desc)}</p>
                                <p class="text-[#C5A467] font-semibold mt-2">${escapeHtml(product.price)}</p>
                            </div>
                        </div>
                    `;
                });
                jewelryGrid.innerHTML = html;
            } else {
                jewelryGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No jewelry products available.</p>';
            }
            
            // Re-observe new elements for animation
            setTimeout(() => {
                document.querySelectorAll('#jewelryGrid .animate-on-scroll').forEach(el => {
                    observer.observe(el);
                });
            }, 100);
        }

        // Update Watch cards
        const watchGrid = document.getElementById('watchGrid');
        if (watchGrid) {
            if (dynamicProducts.watch && dynamicProducts.watch.length > 0) {
                const placeholderImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
                
                let html = '';
                dynamicProducts.watch.forEach((product, index) => {
                    const imgSrc = product.image || placeholderImg;
                    const badge = product.badge || product.category;
                    
                    html += `
                        <div class="watch-card animate-on-scroll cursor-pointer" data-category="${escapeHtml(product.category)}" onclick="openProductModal('watch', ${index})">
                            <div class="relative overflow-hidden group">
                                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" class="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105">
                                ${badge ? `<div class="absolute top-3 left-3">
                                    <span class="bg-[#1a1a1a] text-white text-xs px-2 py-1">${escapeHtml(badge)}</span>
                                </div>` : ''}
                            </div>
                            <div class="p-4">
                                <h3 class="font-playfair text-lg text-[#1a1a1a]">${escapeHtml(product.name)}</h3>
                                <p class="text-sm text-gray-500 mt-1">${escapeHtml(product.desc)}</p>
                                <p class="text-[#C5A467] font-semibold mt-2">${escapeHtml(product.price)}</p>
                            </div>
                        </div>
                    `;
                });
                watchGrid.innerHTML = html;
            } else {
                watchGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No watch products available.</p>';
            }
            
            // Re-observe new elements for animation
            setTimeout(() => {
                document.querySelectorAll('#watchGrid .animate-on-scroll').forEach(el => {
                    observer.observe(el);
                });
            }, 100);
        }

        // Update Featured cards
        const featuredGrid = document.getElementById('featuredGrid');
        if (featuredGrid) {
            if (dynamicProducts.featured && dynamicProducts.featured.length > 0) {
                let html = '';
                dynamicProducts.featured.forEach((product, index) => {
                    const imgSrc = product.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80';
                    
                    html += `
                        <div class="featured-card animate-on-scroll cursor-pointer" onclick="openProductModal('featured', ${index})">
                            <div class="relative overflow-hidden group">
                                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" class="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105">
                            </div>
                            <div class="p-3 text-center">
                                <h3 class="font-playfair text-sm text-[#1a1a1a]">${escapeHtml(product.name)}</h3>
                                <p class="text-[#C5A467] text-sm font-semibold">${escapeHtml(product.price)}</p>
                            </div>
                        </div>
                    `;
                });
                featuredGrid.innerHTML = html;
            } else {
                featuredGrid.innerHTML = '';
            }
            
            // Re-observe new elements for animation
            setTimeout(() => {
                document.querySelectorAll('#featuredGrid .animate-on-scroll').forEach(el => {
                    observer.observe(el);
                });
            }, 100);
        }

        // Update jewelry category filters
        updateJewelryFilters();
        
        // Re-attach filter event listeners
        attachFilterListeners();
    }

    // Dynamically generate jewelry category filters
    function updateJewelryFilters() {
        const filtersContainer = document.getElementById('jewelryFilters');
        if (!filtersContainer) return;
        
        // Collect unique categories from jewelry products
        const categories = new Set();
        if (dynamicProducts.jewelry) {
            dynamicProducts.jewelry.forEach(product => {
                if (product.category) {
                    categories.add(product.category);
                }
            });
        }
        
        let html = '<button class="filter-btn active" data-category="all">All</button>';
        
        // Sort categories alphabetically
        const sortedCategories = Array.from(categories).sort();
        sortedCategories.forEach(category => {
            const displayName = category.charAt(0).toUpperCase() + category.slice(1);
            html += `<button class="filter-btn" data-category="${escapeHtml(category)}">${escapeHtml(displayName)}</button>`;
        });
        
        filtersContainer.innerHTML = html;
    }

    // ============================================
    // Order Steps Dynamic Rendering
    // ============================================
    
    // Load and render order steps from order.json
    async function loadOrderSteps() {
        try {
            const response = await fetch('content/order/order.json');
            if (response.ok) {
                const data = await response.json();
                if (data.steps && Array.isArray(data.steps)) {
                    renderOrderSteps(data.steps);
                }
            }
        } catch (e) {
            console.log('Failed to load order steps:', e.message);
        }
    }
    
    // Render order step cards dynamically
    function renderOrderSteps(steps) {
        const container = document.getElementById('orderStepsGrid');
        if (!container) return;
        
        let html = '';
        steps.forEach((step, index) => {
            const imageSrc = convertImagePath(step.image) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80';
            html += `
                <div class="step-card animate-on-scroll" style="animation-delay: ${index * 100}ms">
                    <div class="text-center">
                        <div class="step-number mx-auto mb-4">${escapeHtml(step.number || (index + 1).toString())}</div>
                        <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(step.title || '')}" class="w-full aspect-square object-cover mb-4">
                        <h3 class="font-playfair text-lg mb-2" style="color: #C5A467">${escapeHtml(step.title || '')}</h3>
                        <p class="text-textLight text-sm">${escapeHtml(step.description || '')}</p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Re-observe new elements for animation
        setTimeout(() => {
            document.querySelectorAll('#orderStepsGrid .animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }, 100);
    }
    
    // Load order steps on page load
    loadOrderSteps();

    // Attach filter event listeners for dynamically generated buttons
    function attachFilterListeners() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');
        
        filterBtns.forEach(btn => {
            // Remove existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.dataset.category;
                
                document.querySelectorAll('.product-card').forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.classList.remove('hidden-category');
                        card.style.display = '';
                    } else {
                        card.classList.add('hidden-category');
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    window.openProductModal = function(type, id) {
        const modal = document.getElementById('productModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const modalDescription = document.getElementById('modalDescription');
        const modalCategory = document.getElementById('modalCategory');
        
        // Use dynamic products
        const products = dynamicProducts[type];
        
        if (products && products.length > 0 && id < products.length) {
            const product = products[id];
            modalImage.src = product.image || '';
            modalTitle.textContent = product.name || 'Product';
            modalPrice.textContent = product.price || '';
            modalDescription.textContent = product.desc || '';
            modalCategory.textContent = product.categoryDisplay || product.category || '';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            // Show "no product" message
            modalImage.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80';
            modalTitle.textContent = '暂无产品信息';
            modalPrice.textContent = '';
            modalDescription.textContent = '';
            modalCategory.textContent = '';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.closeProductModal = function() {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // ============================================
    // Initialize
    // ============================================
    window.dispatchEvent(new Event('scroll'));
    
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // Load products on page load
    loadProducts();
});

// FAQ Accordion Toggle
function toggleFaq(button) {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('.faq-icon');
    const isOpen = answer.classList.contains('faq-open');

    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        const otherAnswer = item.querySelector('.faq-answer');
        const otherIcon = item.querySelector('.faq-icon');
        if (otherAnswer && otherAnswer !== answer) {
            otherAnswer.classList.remove('faq-open');
            otherAnswer.style.maxHeight = '0px';
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
    });

    // Toggle current item
    if (isOpen) {
        answer.classList.remove('faq-open');
        answer.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
    } else {
        answer.classList.add('faq-open');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}

// ============================================
// Process Steps Dynamic Loading
// ============================================
async function loadProcessSteps() {
    const container = document.getElementById('processStepsContainer');
    if (!container) return;

    try {
        // Fetch all process step files
        const steps = [];
        let stepNum = 1;
        let hasMore = true;

        // Try to load steps from content/process/ directory
        while (hasMore) {
            try {
                const response = await fetch(`content/process/step-${stepNum}.md`);
                if (!response.ok) {
                    hasMore = false;
                    break;
                }
                const text = await response.text();
                
                // Parse frontmatter
                const frontmatter = parseFrontmatter(text);
                steps.push({
                    order: parseInt(frontmatter.order) || stepNum,
                    title: frontmatter.title || `Step ${stepNum}`,
                    image: frontmatter.image || ''
                });
                stepNum++;
            } catch (e) {
                hasMore = false;
            }
        }

        // If we loaded steps, replace the container content
        if (steps.length > 0) {
            // Sort by order
            steps.sort((a, b) => a.order - b.order);

            // Build new HTML
            let html = '';
            steps.forEach((step, index) => {
                html += `
                    <div class="process-card animate-on-scroll">
                        <div class="process-card-image">
                            <img style="width:100%;height:200px;object-fit:cover;object-position:center;display:block;" src="${escapeHtml(step.image)}" alt="${index + 1} ${escapeHtml(step.title)}" loading="lazy">
                        </div>
                        <p class="process-card-title" style="font-family:Playfair Display,serif;font-size:1.375rem;font-weight:700;color:#C5A467 !important;text-align:center;padding:14px 16px 18px;margin:0;letter-spacing:0.02em;">${index + 1} ${escapeHtml(step.title)}</p>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Re-observe new elements for animation
            setTimeout(() => {
                document.querySelectorAll('#processStepsContainer .animate-on-scroll').forEach(el => {
                    observer.observe(el);
                });
            }, 100);
        }
    } catch (e) {
        // Keep fallback content if loading fails
        console.log('Using default process steps content');
    }
}

// Simple frontmatter parser
function parseFrontmatter(text) {
    const result = {};
    const lines = text.split('\n');
    let inFrontmatter = false;

    for (const line of lines) {
        if (line.trim() === '---') {
            if (inFrontmatter) {
                break; // End of frontmatter
            }
            inFrontmatter = true;
            continue;
        }

        if (inFrontmatter && line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            result[key] = value;
        }
    }

    return result;
}

// HTML escape utility
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load process steps on page load
document.addEventListener('DOMContentLoaded', loadProcessSteps);
// ============================================
// Partner Cases Image Carousel
// ============================================
const carouselState = {};

// Initialize carousel for a specific case
function initCarousel(caseId, totalImages) {
    carouselState[caseId] = {
        currentIndex: 0,
        totalImages: totalImages
    };
    updateCarouselIndicators(caseId);
}

// Move carousel in direction (-1 = prev, 1 = next)
window.moveCarousel = function(caseId, direction) {
    const state = carouselState[caseId];
    if (!state) return;
    
    state.currentIndex += direction;
    
    // Wrap around
    if (state.currentIndex < 0) {
        state.currentIndex = state.totalImages - 1;
    } else if (state.currentIndex >= state.totalImages) {
        state.currentIndex = 0;
    }
    
    // Update visual
    const carousel = document.querySelector(`.partner-image-carousel[data-case="${caseId}"]`);
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const imageWidth = 100 / state.totalImages;
        track.style.transform = `translateX(-${state.currentIndex * imageWidth}%)`;
    }
    
    updateCarouselIndicators(caseId);
};

// Update carousel indicators
function updateCarouselIndicators(caseId) {
    const state = carouselState[caseId];
    if (!state) return;
    
    const carousel = document.querySelector(`.partner-image-carousel[data-case="${caseId}"]`);
    if (carousel) {
        const indicators = carousel.querySelectorAll('.indicator');
        indicators.forEach((ind, idx) => {
            if (idx === state.currentIndex) {
                ind.classList.add('active');
                ind.style.backgroundColor = '#C5A467';
            } else {
                ind.classList.remove('active');
                ind.style.backgroundColor = 'rgba(255,255,255,0.5)';
            }
        });
    }
}

// ============================================
// Partner Cases Lightbox
// ============================================
let lightboxState = {
    caseId: null,
    currentIndex: 0,
    images: []
};

function openLightbox(caseId, imageIndex) {
    const carousel = document.querySelector(`.partner-image-carousel[data-case="${caseId}"]`);
    if (!carousel) return;
    
    const images = Array.from(carousel.querySelectorAll('.carousel-track img'));
    lightboxState = {
        caseId: caseId,
        currentIndex: imageIndex,
        images: images.map(img => img.src.replace('w=600', 'w=1200'))
    };
    
    const lightbox = document.getElementById('partnerLightbox');
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateLightboxImage();
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('partnerLightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');
    
    if (lightboxImg && lightboxState.images[lightboxState.currentIndex]) {
        lightboxImg.src = lightboxState.images[lightboxState.currentIndex];
    }
    if (lightboxCounter) {
        lightboxCounter.textContent = `${lightboxState.currentIndex + 1} / ${lightboxState.images.length}`;
    }
}

function navigateLightbox(direction) {
    lightboxState.currentIndex += direction;
    
    // Wrap around
    if (lightboxState.currentIndex < 0) {
        lightboxState.currentIndex = lightboxState.images.length - 1;
    } else if (lightboxState.currentIndex >= lightboxState.images.length) {
        lightboxState.currentIndex = 0;
    }
    
    updateLightboxImage();
}

// ============================================
// Partner Cases Dynamic Loading
// ============================================
async function loadPartnerCases() {
    const container = document.getElementById('partnerCasesContainer');
    if (!container) return;
    
    try {
        const cases = [];
        let caseNum = 1;
        let hasMore = true;
        
        // Try to load cases from content/partner-cases/ directory
        while (hasMore) {
            try {
                const response = await fetch(`content/partner-cases/case-${caseNum}.md`);
                if (!response.ok) {
                    hasMore = false;
                    break;
                }
                const text = await response.text();
                const frontmatter = parseFrontmatter(text);
                
                // Parse images (could be a list or single image)
                let images = [];
                if (frontmatter.images) {
                    if (Array.isArray(frontmatter.images)) {
                        images = frontmatter.images;
                    } else {
                        images = frontmatter.images.split(',').map(s => s.trim());
                    }
                } else if (frontmatter.image) {
                    images = [frontmatter.image];
                }
                
                cases.push({
                    order: parseInt(frontmatter.order) || caseNum,
                    title: frontmatter.title || `Partner Case ${caseNum}`,
                    description: frontmatter.description || '',
                    images: images,
                    published: frontmatter.published !== 'false'
                });
                caseNum++;
            } catch (e) {
                hasMore = false;
            }
        }
        
        // If we loaded cases, replace the container content
        if (cases.length > 0) {
            // Sort by order
            cases.sort((a, b) => a.order - b.order);
            
            // Filter published only
            const publishedCases = cases.filter(c => c.published);
            
            if (publishedCases.length > 0) {
                let html = '';
                publishedCases.forEach((caseData, index) => {
                    const caseId = `dynamic-case-${index + 1}`;
                    const imageCount = caseData.images.length;
                    
                    html += `
                        <div class="partner-case-card animate-on-scroll bg-cream rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            <div class="relative">
                                <div class="partner-image-carousel" data-case="${caseId}">
                                    <div class="carousel-track flex transition-transform duration-300">
                                        ${caseData.images.map((img, imgIdx) => `
                                            <img src="${escapeHtml(img)}" alt="${escapeHtml(caseData.title)}" 
                                                 class="w-full object-cover flex-shrink-0 cursor-zoom-in"
                                                 onclick="openLightbox('${caseId}', ${imgIdx})">
                                        `).join('')}
                                    </div>
                                    ${imageCount > 1 ? `
                                        <button class="carousel-btn carousel-prev absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors" onclick="event.stopPropagation(); moveCarousel('${caseId}', -1)">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                                        </button>
                                        <button class="carousel-btn carousel-next absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors" onclick="event.stopPropagation(); moveCarousel('${caseId}', 1)">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                        </button>
                                        <div class="carousel-indicators absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                            ${caseData.images.map((_, imgIdx) => `
                                                <span class="indicator w-2 h-2 rounded-full ${imgIdx === 0 ? 'bg-white/90' : 'bg-white/50'}" data-index="${imgIdx}"></span>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="p-6">
                                <h3 class="font-playfair text-xl mb-2" style="color: #C5A467">${escapeHtml(caseData.title)}</h3>
                                <p class="text-textMedium text-sm leading-relaxed">${escapeHtml(caseData.description)}</p>
                            </div>
                        </div>
                    `;
                });
                
                container.innerHTML = html;
                
                // Initialize carousels
                publishedCases.forEach((_, index) => {
                    const caseId = `dynamic-case-${index + 1}`;
                    const imageCount = publishedCases[index].images.length;
                    initCarousel(caseId, imageCount);
                });
                
                // Re-observe new elements for animation
                setTimeout(() => {
                    document.querySelectorAll('#partnerCasesContainer .animate-on-scroll').forEach(el => {
                        observer.observe(el);
                    });
                }, 100);
            }
        }
    } catch (e) {
        // Keep fallback content if loading fails
        console.log('Using default partner cases content');
    }
}

// ============================================
// Initialize Partner Cases
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default carousels
    initCarousel('case1', 4);
    initCarousel('case2', 5);
    initCarousel('case3', 4);
    
    // Add click handlers for default case images
    document.querySelectorAll('.partner-image-carousel[data-case^="case"]').forEach(carousel => {
        const caseId = carousel.dataset.case;
        const images = carousel.querySelectorAll('.carousel-track img');
        images.forEach((img, idx) => {
            img.addEventListener('click', () => openLightbox(caseId, idx));
        });
    });
    
    // Try to load dynamic content
    loadPartnerCases();
});

// Lightbox keyboard navigation
document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('partnerLightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
    }
});
