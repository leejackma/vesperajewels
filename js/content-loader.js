/**
 * Vespera Jewels - Content Loader
 * Loads CMS content and renders to page dynamically
 */

class ContentLoader {
    constructor() {
        this.contentCache = {};
    }

    async init() {
        await this.loadAllContent();
        this.renderContent();
        this.initFAQAccordion();
    }

    async loadAllContent() {
        // Load theme first for colors
        await this.loadTheme();
        
        // Load section content
        const sections = ['home', 'about', 'jewelry', 'watches', 'order', 'contact'];
        for (const section of sections) {
            await this.loadSection(section);
        }
        
        // Load FAQ items dynamically
        await this.loadFAQItems();
    }

    async loadTheme() {
        try {
            const response = await fetch('content/settings/theme.json');
            if (!response.ok) throw new Error('JSON not found');
            this.contentCache.theme = await response.json();
            this.applyTheme(this.contentCache.theme);
        } catch {
            try {
                const response = await fetch('content/settings/theme.md');
                if (response.ok) {
                    const text = await response.text();
                    this.contentCache.theme = this.parseFrontmatter(text);
                    this.applyTheme(this.contentCache.theme);
                }
            } catch (e) {
                console.log('Using default theme');
            }
        }
    }

    async loadSection(section) {
        const paths = {
            home: 'content/home/home.md',
            about: 'content/about/about.md',
            jewelry: 'content/jewelry/jewelry.md',
            watches: 'content/watches/watches.md',
            order: 'content/order/how-to-order.md',
            contact: 'content/contact/contact.md'
        };
        
        try {
            const response = await fetch(paths[section]);
            if (response.ok) {
                const text = await response.text();
                this.contentCache[section] = this.parseFrontmatter(text);
            }
        } catch (e) {
            console.log(`Failed to load ${section}`);
        }
    }

    async loadFAQItems() {
        // List of known FAQ files - in production this would be fetched from API
        const faqFiles = [
            'how-to-pay',
            'out-of-stock', 
            'how-to-know-price',
            'brand-box',
            'quality-confirmation',
            'more-pictures',
            'personal-wholesale',
            'worldwide-shipping',
            'delivery-time',
            'quality-problem'
        ];
        
        this.contentCache.faqItems = [];
        
        for (const file of faqFiles) {
            try {
                const response = await fetch(`content/faq/items/${file}.md`);
                if (response.ok) {
                    const text = await response.text();
                    const item = this.parseFrontmatter(text);
                    item._file = file;
                    this.contentCache.faqItems.push(item);
                }
            } catch (e) {
                // File not found, skip
            }
        }
        
        // Sort by order
        this.contentCache.faqItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    parseFrontmatter(text) {
        const match = text.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return {};
        
        const yaml = match[1];
        const result = {};
        const lines = yaml.split('\n');
        let currentArray = null;
        
        for (const line of lines) {
            // List item with object
            const listObjMatch = line.match(/^\s+-\s+\{(.+)\}$/);
            if (listObjMatch) {
                const obj = {};
                const pairs = listObjMatch[1].split(',');
                for (const pair of pairs) {
                    const [k, v] = pair.split(':').map(s => s.trim().replace(/^["']|["']$/g, ''));
                    if (k && v !== undefined) obj[k] = v;
                }
                if (currentArray) result[currentArray].push(obj);
                continue;
            }
            
            // Array start
            const arrayMatch = line.match(/^(\w+):\s*$/);
            if (arrayMatch) {
                currentArray = arrayMatch[1];
                result[currentArray] = [];
                continue;
            }
            
            // Key-value
            const kvMatch = line.match(/^(\w+):\s*(.*)$/);
            if (kvMatch) {
                currentArray = null;
                const key = kvMatch[1];
                let value = kvMatch[2].trim();
                
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                result[key] = value;
            } else if (line.trim() === '|') {
                // Multi-line text follows - collect remaining lines until ---
                const rest = text.slice(text.indexOf(line) + line.length).split('---')[0].trim();
                if (currentArray) {
                    result[currentArray].push(rest);
                } else {
                    result[key] = rest;
                }
            }
        }
        
        return result;
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
        this.setText('[data-cms="home.featured_title"]', home.featured_title);
        this.setText('[data-cms="home.craft_label"]', home.craft_label);
        this.setText('[data-cms="home.craft_title"]', home.craft_title);

        // Brand promises
        if (home.brand_promises) {
            home.brand_promises.forEach((p, i) => {
                this.setText(`[data-cms="home.promise.${i}.icon"]`, p.icon);
                this.setText(`[data-cms="home.promise.${i}.title"]`, p.title);
                this.setText(`[data-cms="home.promise.${i}.description"]`, p.description);
            });
        }
    }

    renderAbout() {
        const about = this.contentCache.about;
        if (!about) return;

        this.setText('[data-cms="about.section_label"]', about.section_label);
        this.setText('[data-cms="about.section_title"]', about.section_title);
        this.setText('[data-cms="about.story.0"]', about.story_paragraphs?.[0] || about.story);
        this.setText('[data-cms="about.story.1"]', about.story_paragraphs?.[1]);
        this.setText('[data-cms="about.story.2"]', about.story_paragraphs?.[2]);
        
        if (about.story_image) {
            this.setImage('[data-cms="about.story_image"]', about.story_image);
        }

        this.setText('[data-cms="about.highlights_label"]', about.highlights_label);
        this.setText('[data-cms="about.highlights_title"]', about.highlights_title);
        
        if (about.highlights) {
            about.highlights.forEach((h, i) => {
                this.setText(`[data-cms="about.highlight.${i}.icon"]`, h.icon);
                this.setText(`[data-cms="about.highlight.${i}.title"]`, h.title);
                this.setText(`[data-cms="about.highlight.${i}.description"]`, h.description);
            });
        }

        this.setText('[data-cms="about.process_label"]', about.process_label);
        this.setText('[data-cms="about.process_title"]', about.process_title);
        
        if (about.process_steps) {
            about.process_steps.forEach((s, i) => {
                this.setText(`[data-cms="about.process.${i}.number"]`, s.number);
                this.setText(`[data-cms="about.process.${i}.title"]`, s.title);
            });
        }

        this.setText('[data-cms="about.promises_label"]', about.promises_label);
        this.setText('[data-cms="about.promises_title"]', about.promises_title);
        
        if (about.promises) {
            about.promises.forEach((p, i) => {
                this.setText(`[data-cms="about.promise.${i}"]`, typeof p === 'string' ? p : p.text);
            });
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
        this.setText('[data-cms="faq.section_label"]', 'QUESTIONS');
        this.setText('[data-cms="faq.section_title"]', 'Frequently Asked Questions');
        
        // Render FAQ items dynamically
        this.renderFAQItems();
    }

    renderFAQItems() {
        const container = document.getElementById('faqContainer');
        if (!container || !this.contentCache.faqItems) return;
        
        container.innerHTML = '';
        
        for (const item of this.contentCache.faqItems) {
            if (item.published === false) continue;
            
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item border border-border bg-white';
            
            faqItem.innerHTML = `
                <button class="faq-question w-full flex items-center justify-between p-6 text-left" onclick="toggleFAQ(this)">
                    <span class="font-playfair text-lg pr-4" style="color: var(--color-accent)">${item.question || item.title}</span>
                    <svg class="faq-icon w-5 h-5 text-gold transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="faq-answer hidden px-6 pb-6">
                    <div class="text-textLight leading-relaxed">
                        ${this.formatAnswer(item.answer)}
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

        this.setText('[data-cms="order.section_label"]', o.section_label);
        this.setText('[data-cms="order.section_title"]', o.section_title);
        this.setText('[data-cms="order.section_subtitle"]', o.section_subtitle);
        this.setText('[data-cms="order.cta_title"]', o.cta_title);
        this.setText('[data-cms="order.cta_subtitle"]', o.cta_subtitle);
        this.setText('[data-cms="order.cta_whatsapp"]', o.cta_whatsapp);
        this.setText('[data-cms="order.cta_email"]', o.cta_email);
        this.setText('[data-cms="order.cta_form"]', o.cta_form);

        if (o.steps) {
            o.steps.forEach((s, i) => {
                this.setText(`[data-cms="order.step.${i}.number"]`, s.number);
                this.setText(`[data-cms="order.step.${i}.title"]`, s.title);
                this.setText(`[data-cms="order.step.${i}.description"]`, s.description);
            });
        }
    }

    renderContact() {
        const c = this.contentCache.contact;
        if (!c) return;

        this.setText('[data-cms="contact.section_label"]', c.section_label);
        this.setText('[data-cms="contact.section_title"]', c.section_title);
        this.setText('[data-cms="contact.intro"]', c.intro);
        this.setText('[data-cms="contact.social_title"]', c.social_title);
        this.setText('[data-cms="contact.form_title"]', c.form_title);
        this.setText('[data-cms="contact.form_success_title"]', c.form_success_title);
        this.setText('[data-cms="contact.form_success_message"]', c.form_success_message);

        if (c.contact_items) {
            c.contact_items.forEach((item, i) => {
                this.setText(`[data-cms="contact.item.${i}.title"]`, item.title);
                this.setText(`[data-cms="contact.item.${i}.content"]`, item.content);
            });
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
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    }

    setImage(selector, src) {
        if (!src) return;
        const el = document.querySelector(selector);
        if (el) el.src = src;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ContentLoader();
    loader.init();
});
