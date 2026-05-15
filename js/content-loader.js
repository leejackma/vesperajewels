/**
 * Vespera Jewels - Content Loader
 * Loads CMS content from JSON files and renders to page dynamically
 */

class ContentLoader {
    constructor() {
        this.contentCache = {};
    }

    // Ensure a value is an array - handles string "[]", null, undefined
    ensureArray(val) {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
            try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch(e) { return []; }
        }
        return [];
    }

    async init() {
        try {
            await this.loadAllContent();
            this.renderContent();
            this.initFAQAccordion();
            // Remove the loading overlay to reveal the page
            this.revealPage();
            console.log('ContentLoader: All content loaded and rendered', this.contentCache);
        } catch(e) {
            console.error('ContentLoader error:', e);
            // Even on error, reveal the page so it's not stuck
            this.revealPage();
        }
    }

    revealPage() {
        const overlay = document.getElementById('cms-loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    async loadAllContent() {
        // Load theme first for colors
        await this.loadTheme();
        
        // Load section content
        const sections = ['home', 'about', 'jewelry', 'watches', 'order', 'contact'];
        for (const section of sections) {
            await this.loadSection(section);
        }
        
        // Load FAQ items from combined JSON
        await this.loadFAQItems();
    }

    async loadTheme() {
        try {
            const response = await fetch('content/settings/theme.json');
            if (response.ok) {
                this.contentCache.theme = await response.json();
                this.applyTheme(this.contentCache.theme);
            }
        } catch (e) {
            console.log('Using default theme');
        }
    }

    async loadSection(section) {
        const paths = {
            home: 'content/home/home.json',
            about: 'content/about/about.json',
            jewelry: 'content/jewelry/jewelry.json',
            watches: 'content/watches/watches.json',
            order: 'content/order/order.json',
            contact: 'content/contact/contact.json'
        };
        
        try {
            const response = await fetch(paths[section]);
            if (response.ok) {
                this.contentCache[section] = await response.json();
            }
        } catch (e) {
            console.log(`Failed to load ${section}`);
        }
    }

    async loadFAQItems() {
        try {
            const response = await fetch('content/faq/faq.json');
            if (response.ok) {
                const faqData = await response.json();
                // Support both old array format and new object format
                if (Array.isArray(faqData)) {
                    this.contentCache.faqItems = faqData;
                } else {
                    this.contentCache.faq = faqData;
                    this.contentCache.faqItems = faqData.items || [];
                }
                // Sort by order
                this.contentCache.faqItems.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
            }
        } catch (e) {
            console.log('Failed to load FAQ items');
            this.contentCache.faqItems = [];
        }
    }

    applyTheme(theme) {
        if (!theme) return;
        const root = document.documentElement;
        
        if (theme.colors) {
            const colorMap = {
                primary_bg: '--color-primary-bg',
                white_bg: '--color-white-bg',
                dark_bg: '--color-dark-bg',
                accent_gold: '--color-accent',
                accent_gold_dark: '--color-accent-dark',
                text_primary: '--color-text-primary',
                text_medium: '--color-text-medium',
                text_secondary: '--color-text-secondary',
                border_color: '--color-border'
            };
            
            for (const [key, cssVar] of Object.entries(colorMap)) {
                if (theme.colors[key]) {
                    root.style.setProperty(cssVar, theme.colors[key]);
                }
            }
        }
        
        if (theme.hero?.overlay_opacity) {
            root.style.setProperty('--hero-overlay-opacity', theme.hero.overlay_opacity / 100);
        }
        
        // Apply WhatsApp CTA
        if (theme.whatsapp_cta) {
            const btn = document.getElementById('whatsappCtaBtn');
            if (btn && theme.whatsapp_cta.link) btn.href = theme.whatsapp_cta.link;
            const text = document.getElementById('whatsappCtaText');
            if (text && theme.whatsapp_cta.text) text.textContent = theme.whatsapp_cta.text;
            // Update product modal WhatsApp button
            const productBtn = document.getElementById('productWhatsappBtn');
            if (productBtn && theme.whatsapp_cta.link) {
                productBtn.href = theme.whatsapp_cta.link + '?text=' + encodeURIComponent("I'm interested in this product");
            }
        }
    }

    renderContent() {
        this.renderHome();
        this.renderAbout();
        this.renderJewelry();
        this.renderWatches();
        this.renderOrder();
        this.renderContact();
        this.renderFAQ();
    }

    renderHome() {
        const home = this.contentCache.home;
        if (!home) return;

        this.setText('[data-cms="home.hero_title"]', home.hero_title);
        this.setText('[data-cms="home.hero_subtitle"]', home.hero_subtitle);

        // Hero background image
        if (home.hero_image) {
            const heroImg = document.getElementById('heroBgImg') || document.querySelector('#home .absolute.inset-0 img');
            if (heroImg) {
                // If it's a relative path (uploaded image), prepend site base or use as-is
                // Relative paths like /assets/uploads/... will resolve against the site domain
                heroImg.src = home.hero_image;
            }
        }
        this.setText('[data-cms="home.featured_title"]', home.featured_title);
        this.setText('[data-cms="home.craft_label"]', home.craft_label);
        this.setText('[data-cms="home.craft_title"]', home.craft_title);

        // Craft images
        ['craft_image_1', 'craft_image_2', 'craft_image_3'].forEach(key => {
            if (home[key]) {
                const img = document.querySelector(`[data-cms="home.${key}"]`);
                if (img) img.src = home[key];
            }
        });

        // Brand promises - dynamic rendering
        this.setText('[data-cms="home.promises_label"]', home.promises_label);
        this.setText('[data-cms="home.promises_title"]', home.promises_title);
        if (home.brand_promises && Array.isArray(home.brand_promises) && home.brand_promises.length > 0) {
            const grid = document.getElementById('brandPromisesGrid');
            if (grid) {
                const esc = typeof escapeHtml === 'function' ? escapeHtml : (t => t);
                let html = '';
                home.brand_promises.forEach((p, i) => {
                    html += `
                        <div class="bg-white p-8 text-center animate-on-scroll border border-border" style="animation-delay: ${i * 100}ms">
                            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-cream flex items-center justify-center">
                                <span class="text-5xl">${esc(p.icon || '📦')}</span>
                            </div>
                            <h3 class="font-playfair text-xl" style="color: #C5A467; margin-bottom: 1rem;">${esc(p.title || '')}</h3>
                            <p class="text-textLight text-sm leading-relaxed">${esc(p.description || '')}</p>
                        </div>
                    `;
                });
                grid.innerHTML = html;
            }
        }
    }

    renderAbout() {
        const about = this.contentCache.about;
        if (!about) return;

        this.setText('[data-cms="about.section_label"]', about.section_label);
        this.setText('[data-cms="about.section_title"]', about.section_title);
        
        // Handle story_paragraphs
        let storyParagraphs = about.story_paragraphs;
        if (typeof storyParagraphs === 'string') {
            try {
                storyParagraphs = JSON.parse(storyParagraphs);
            } catch (e) {
                storyParagraphs = [storyParagraphs];
            }
        }
        
        this.setText('[data-cms="about.story.0"]', storyParagraphs?.[0] || about.story);
        this.setText('[data-cms="about.story.1"]', storyParagraphs?.[1]);
        this.setText('[data-cms="about.story.2"]', storyParagraphs?.[2]);
        
        if (about.story_image) {
            this.setImage('[data-cms="about.story_image"]', about.story_image);
        }

        this.setText('[data-cms="about.highlights_label"]', about.highlights_label);
        this.setText('[data-cms="about.highlights_title"]', about.highlights_title);
        
        // Handle highlights
        if (about.highlights) {
            let highlights = about.highlights;
            if (typeof highlights === 'string') {
                try {
                    highlights = JSON.parse(highlights);
                } catch (e) {
                    highlights = [];
                }
            }
            if (Array.isArray(highlights)) {
                this.ensureArray(highlights).forEach((h, i) => {
                    this.setText(`[data-cms="about.highlight.${i}.icon"]`, h.icon);
                    this.setText(`[data-cms="about.highlight.${i}.title"]`, h.title);
                    this.setText(`[data-cms="about.highlight.${i}.description"]`, h.description);
                });
            }
        }

        this.setText('[data-cms="about.process_label"]', about.process_label);
        this.setText('[data-cms="about.process_title"]', about.process_title);
        
        // Handle process_steps
        if (about.process_steps) {
            let processSteps = about.process_steps;
            if (typeof processSteps === 'string') {
                try {
                    processSteps = JSON.parse(processSteps);
                } catch (e) {
                    processSteps = [];
                }
            }
            if (Array.isArray(processSteps)) {
                this.ensureArray(processSteps).forEach((s, i) => {
                    this.setText(`[data-cms="about.process.${i}.number"]`, s.number);
                    this.setText(`[data-cms="about.process.${i}.title"]`, s.title);
                });
            }
        }

        this.setText('[data-cms="about.promises_label"]', about.promises_label);
        this.setText('[data-cms="about.promises_title"]', about.promises_title);
        
        // Handle promises
        if (about.promises) {
            let promises = about.promises;
            if (typeof promises === 'string') {
                try {
                    promises = JSON.parse(promises);
                } catch (e) {
                    promises = [promises];
                }
            }
            if (Array.isArray(promises)) {
                this.ensureArray(promises).forEach((p, i) => {
                    this.setText(`[data-cms="about.promise.${i}"]`, typeof p === 'string' ? p : p.text);
                });
            }
        }
    }

    renderJewelry() {
        const j = this.contentCache.jewelry;
        if (!j) return;
        this.setText('[data-cms="jewelry.section_label"]', j.section_label);
        this.setText('[data-cms="jewelry.section_title"]', j.section_title);
        this.setText('[data-cms="jewelry.section_subtitle"]', j.section_subtitle);
    }

    renderWatches() {
        const w = this.contentCache.watches;
        if (!w) return;
        this.setText('[data-cms="watches.section_label"]', w.section_label);
        this.setText('[data-cms="watches.section_title"]', w.section_title);
        this.setText('[data-cms="watches.section_subtitle"]', w.section_subtitle);
    }

    renderFAQ() {
        // Section title
        const faq = this.contentCache.faq || {};
        this.setText('[data-cms="faq.section_label"]', faq.section_label || 'QUESTIONS');
        this.setText('[data-cms="faq.section_title"]', faq.section_title || 'Frequently Asked Questions');
        
        // Render FAQ items dynamically
        this.renderFAQItems();
    }

    renderFAQItems() {
        const container = document.getElementById('faqContainer');
        if (!container || !this.contentCache.faqItems) return;
        
        container.innerHTML = '';
        
        for (const item of this.contentCache.faqItems) {
            if (item.published === false || item.published === 'false') continue;
            
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item border border-border bg-white';
            
            // Handle multi-line answer with | format
            let answer = item.answer || '';
            if (typeof answer === 'string' && answer.startsWith('|')) {
                // Parse the | format
                answer = answer.replace(/^\|\s*/, '').trim();
            }
            
            faqItem.innerHTML = `
                <button class="faq-question w-full flex items-center justify-between p-6 text-left" onclick="toggleFAQ(this)">
                    <span class="font-playfair text-lg pr-4" style="color: var(--color-accent)">${item.question || item.title}</span>
                    <svg class="faq-icon w-5 h-5 text-gold transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="faq-answer hidden px-6 pb-6">
                    <div class="text-textLight leading-relaxed">
                        ${this.formatAnswer(answer)}
                    </div>
                </div>
            `;
            
            container.appendChild(faqItem);
        }
    }

    formatAnswer(text) {
        if (!text) return '';
        // Convert markdown-style formatting
        return text
            .replace(/\n\n/g, '</p><p class="mb-3">')
            .replace(/\n/g, '<br>');
    }

    renderOrder() {
        const o = this.contentCache.order;
        if (!o) return;

        // Update section labels and CTA text
        this.setText('[data-cms="order.section_label"]', o.section_label);
        this.setText('[data-cms="order.section_title"]', o.section_title);
        this.setText('[data-cms="order.section_subtitle"]', o.section_subtitle);
        this.setText('[data-cms="order.cta_title"]', o.cta_title);
        this.setText('[data-cms="order.cta_subtitle"]', o.cta_subtitle);
        this.setText('[data-cms="order.cta_whatsapp"]', o.cta_whatsapp);
        this.setText('[data-cms="order.cta_email"]', o.cta_email);
        this.setText('[data-cms="order.cta_form"]', o.cta_form);
        
        // Steps are now dynamically rendered in main.js via loadOrderSteps()
        // No need to handle steps here
    }

    renderContact() {
        const c = this.contentCache.contact;
        console.log('renderContact called, data:', c);
        if (!c) return;

        this.setText('[data-cms="contact.section_label"]', c.section_label);
        this.setText('[data-cms="contact.section_title"]', c.section_title);
        this.setText('[data-cms="contact.intro"]', c.intro);
        this.setText('[data-cms="contact.social_title"]', c.social_title);
        this.setText('[data-cms="contact.form_title"]', c.form_title);
        this.setText('[data-cms="contact.form_success_title"]', c.form_success_title);
        this.setText('[data-cms="contact.form_success_message"]', c.form_success_message);

        // Handle contact_items
        if (c.contact_items) {
            let contactItems = c.contact_items;
            if (typeof contactItems === 'string') {
                try {
                    contactItems = JSON.parse(contactItems);
                } catch (e) {
                    contactItems = [];
                }
            }
            if (Array.isArray(contactItems)) {
                this.ensureArray(contactItems).forEach((item, i) => {
                    this.setText(`[data-cms="contact.item.${i}.title"]`, item.title);
                    this.setText(`[data-cms="contact.item.${i}.content"]`, item.content);
                });
            }
        }
        
        // Render social media links
        let socialLinks = c.social_links;
        if (typeof socialLinks === 'string') {
            try {
                socialLinks = JSON.parse(socialLinks);
            } catch (e) {
                socialLinks = [];
            }
        }
        this.renderSocialLinks(socialLinks);
    }
    
    renderSocialLinks(socialLinks) {
        if (!socialLinks || !Array.isArray(socialLinks)) {
            // Show all default icons if no CMS data
            ['socialWhatsApp','socialFacebook','socialInstagram','socialTiktok','socialEmail'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'flex';
            });
            return;
        }
        
        const socialIcons = {
            whatsapp: document.getElementById('socialWhatsApp'),
            facebook: document.getElementById('socialFacebook'),
            instagram: document.getElementById('socialInstagram'),
            tiktok: document.getElementById('socialTiktok'),
            email: document.getElementById('socialEmail')
        };
        
        // Show icons that have links configured
        const configuredTypes = new Set();
        this.ensureArray(socialLinks).forEach(link => {
            if (link.type && link.url && socialIcons[link.type]) {
                const icon = socialIcons[link.type];
                icon.href = link.type === 'email' ? `mailto:${link.url}` : link.url;
                icon.style.display = 'flex';
                configuredTypes.add(link.type);
            }
        });
        
        // Hide icons that don't have links
        for (const [type, icon] of Object.entries(socialIcons)) {
            if (!configuredTypes.has(type)) {
                icon.style.display = 'none';
            }
        }
        
        // Update Order CTA buttons (WhatsApp + Email) from contact social_links
        const whatsappLink = socialLinks.find(l => l.type === 'whatsapp');
        const emailLink = socialLinks.find(l => l.type === 'email');
        
        // WhatsApp button in Order section
        const orderWhatsappBtn = document.querySelector('#order a[href*="wa.me"]');
        if (orderWhatsappBtn && whatsappLink) {
            orderWhatsappBtn.href = whatsappLink.url;
        }
        
        // Email button in Order section
        const orderEmailBtn = document.querySelector('#order a[href^="mailto:"]');
        if (orderEmailBtn && emailLink) {
            orderEmailBtn.href = `mailto:${emailLink.url}`;
        }
        
        // Hero WhatsApp CTA button
        const whatsappCta = document.getElementById('whatsappCtaBtn');
        if (whatsappCta && whatsappLink) {
            whatsappCta.href = whatsappLink.url;
        }
    }

    initFAQAccordion() {
        // FAQ toggle function - global for inline onclick
        window.toggleFAQ = function(button) {
            const faqItem = button.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = faqItem.querySelector('.faq-icon');
            
            // Check if currently open
            const isOpen = !answer.classList.contains('hidden');
            
            // Close all others (optional - remove if you want multiple open)
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').classList.add('hidden');
                    item.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current
            if (isOpen) {
                faqItem.classList.remove('active');
                answer.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
            } else {
                faqItem.classList.add('active');
                answer.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            }
        };
    }

    setText(selector, value) {
        if (!value) return;
        document.querySelectorAll(selector).forEach(el => {
            el.textContent = value;
        });
    }

    setImage(selector, src) {
        if (!src) return;
        document.querySelectorAll(selector).forEach(el => {
            el.src = src;
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ContentLoader();
    loader.init();
});
