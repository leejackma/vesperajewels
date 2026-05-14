# Vespera Jewels - Brand Website

A luxury jewelry and watches brand website built with HTML, CSS, and JavaScript, featuring Decap CMS for content management.

## Project Structure

```
vesperajewels/
├── index.html              # Main website page
├── css/
│   └── style.css           # Custom styles
├── js/
│   └── main.js             # JavaScript functionality
├── admin/
│   ├── index.html          # Decap CMS admin panel
│   └── config.yml          # CMS configuration
├── content/                # Markdown content files (for CMS)
│   ├── home/
│   ├── about/
│   ├── jewelry/
│   ├── watches/
│   ├── faq/
│   ├── order/
│   └── contact/
├── assets/
│   ├── logo.png            # Transparent logo (main)
│   ├── logo.jpg            # Dark background logo (alternative)
│   └── uploads/            # CMS uploaded images
└── README.md              # This file
```

## Features

- **Responsive Design**: Mobile-first approach with elegant desktop layouts
- **SPA-style Navigation**: Smooth scrolling between sections
- **Product Filtering**: Filter jewelry by category (rings, necklaces, earrings, bracelets)
- **Product Modal**: Click products to view details with WhatsApp order button
- **FAQ Accordion**: Expandable FAQ sections
- **Contact Form**: Frontend form with validation
- **Scroll Animations**: Intersection Observer-based reveal animations
- **Fixed Navigation**: Sticky navbar with scroll effects
- **Decap CMS**: Full content management system for all website content

## Design

- **Color Palette**:
  - Background: #FAFAF8 (cream), #FFFFFF (white), #0F0F0F (dark)
  - Gold accent: #C5A467, #B8924A
  - Text: #1A1A1A (dark), #333333 (medium), #8A8A8A (light)
  - Borders: #E8E4DE

- **Typography**:
  - Headlines: Playfair Display (serif)
  - Body: Lato (sans-serif)

---

## Deployment to Cloudflare Pages

### Method 1: Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Navigate to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your account

2. **Create a new Pages project**
   - Click **"Workers & Pages"** in the sidebar
   - Click **"Create application"**
   - Select **"Pages"** tab
   - Click **"Upload assets"**

3. **Upload your files**
   - Drag and drop the entire `vesperajewels/` folder
   - Cloudflare will auto-detect settings (none needed for static HTML)
   - Set your **Project name** (e.g., `vesperajewels`)
   - Click **"Deploy site"**

4. **Set up Custom Domain**
   - After deployment, go to **Custom domains**
   - Add `vesperajewels.com`
   - Cloudflare will provide verification instructions

### Method 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy directly
cd vesperajewels
wrangler pages deploy .

# Or create project first
wrangler pages project create vesperajewels
wrangler pages deploy . --project-name=vesperajewels
```

---

## DNS Configuration

Add these DNS records in Cloudflare DNS settings:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | www | `vesperajewels.pages.dev` | Proxied (orange) |
| CNAME | @ | `vesperajewels.pages.dev` | Proxied (orange) |

> **Note**: For `@` CNAME with Cloudflare Pages, you must first add the domain as a custom domain in the Pages dashboard.

### Alternative: Redirect naked domain

If you cannot add @ CNAME directly:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | 192.0.2.1 | DNS Only (grey) |
| CNAME | www | `vesperajewels.pages.dev` | Proxied (orange) |

Then create a Page Rule in Cloudflare to redirect @ to www.

---

## Blocking China IPs (Geographic Restriction)

Since you want to block visitors from mainland China, configure this at the Cloudflare WAF level:

### Step 1: Enable WAF
1. In Cloudflare Dashboard, go to your domain
2. Navigate to **Security** → **WAF**

### Step 2: Create Custom Rule
1. Click **"Create rule"** under Custom Rules
2. Configure the rule:
   - **Field**: `ip.src.country`
   - **Operator**: `matches`
   - **Value**: `CN` (for China)
3. **Action**: `Block`
4. Give the rule a name (e.g., "Block China")
5. Click **"Deploy"**

### Alternative: Use Page Rules
1. Go to **Rules** → **Page Rules**
2. Create a new rule for `vesperajewels.com/*`
3. Add setting: **Security Level** → **I'm Under Attack**
4. Or use **Custom Matching** → **Country** → **China** → **Block**

### Important Notes
- This blocks at the Cloudflare edge - no code changes needed
- Legitimate traffic from China will see a Cloudflare block page
- Consider using a Chinese-specific landing page if needed for business

---

## Decap CMS Setup

### Prerequisites
- Site deployed to Cloudflare Pages
- GitHub/GitLab repository connected (required for CMS authentication)

### Configuration for Cloudflare Pages + GitHub

1. **Push your code to GitHub**
   ```bash
   cd vesperajewels
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/vesperajewels.git
   git push -u origin main
   ```

2. **Update admin/config.yml**
   Change the backend configuration to use GitHub:
   ```yaml
   backend:
     name: github
     repo: YOUR_USERNAME/vesperajewels
     branch: main
   ```

3. **Configure GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth App:
     - **Homepage URL**: `https://vesperajewels.com`
     - **Authorization callback URL**: `https://vesperajewels.com/admin/index.html`
   - Copy the Client ID and Client Secret

4. **Add Identity Provider in Cloudflare Access**
   - Go to Cloudflare Zero Trust → Settings → Authentication
   - Add GitHub as an identity provider with your OAuth credentials

5. **Update Pages Settings**
   - In Cloudflare Pages, go to your project → Settings → Identity
   - Enable **Cloudflare Access**
   - Configure authentication for `/admin/*` routes

### Accessing the CMS

After configuration, access the admin panel at:
```
https://vesperajewels.com/admin/
```

### CMS Features

The admin panel allows editing:

- **Theme Settings**: Colors, fonts, and styling customization
- **Home**: Hero section, featured products, brand promises
- **About Us**: Brand story, highlights, process steps, promises
- **Jewelry Products**: Name, price, description, images, category
- **Watch Products**: Name, price, description, images, category
- **FAQ**: Questions and answers (reorderable)
- **How to Order**: Steps and descriptions
- **Contact**: Address, phone, email, social links

---

## Theme Customization

The website supports real-time color theme customization through the CMS admin panel.

### Theme Settings Available

| Setting | Description | Default |
|---------|-------------|---------|
| Primary Background | Main cream background color | #FAFAF8 |
| White Background | Pure white backgrounds | #FFFFFF |
| Dark Background | Dark section backgrounds | #0F0F0F |
| Accent Gold | Primary gold accent color | #C5A467 |
| Accent Gold Dark | Gold hover/gradient color | #B8924A |
| Primary Text | Headlines and dark text | #1A1A1A |
| Medium Text | Body text color | #333333 |
| Secondary Text | Light/placeholder text | #8A8A8A |
| Border Color | Dividers and borders | #E8E4DE |
| Hero Overlay | Hero image overlay opacity | 40% |
| Hero Text | Hero section text color | #FFFFFF |
| WhatsApp Link | WhatsApp contact link | https://wa.me/1234567890 |
| WhatsApp Button Text | CTA button text | WHATSAPP US |
| WhatsApp Button Color | Button background color | #E8C468 |
| WhatsApp Text Color | Icon & text color | #1A1A1A |

### How to Customize Colors

1. Log in to the CMS admin panel at `/admin/`
2. Navigate to **Theme Settings** collection
3. Use the color picker to select new colors
4. Changes apply automatically to the website

### Theme Files

The theme configuration is stored in:
- `content/settings/theme.json` - Primary (for fast loading)
- `content/settings/theme.md` - CMS editable version

### Implementation

The theme system uses CSS variables for dynamic styling:

```css
:root {
    --color-accent: #C5A467;
    --color-primary-bg: #FAFAF8;
    /* ... */
}
```

The JavaScript in `index.html` loads the theme configuration and applies it to CSS variables on page load.

---

## Decap CMS with Git Gateway (Cloudflare Pages)

For Cloudflare Pages without GitHub:

1. **Enable Cloudflare Pages Git Gateway**
   - In Cloudflare Pages → Settings → Builds and deployments
   - Enable **Access policies**

2. **Update config.yml**:
   ```yaml
   backend:
     name: git-gateway
   ```

3. **Configure Access Policy**
   - Set up Cloudflare Access for the `/admin/*` routes
   - Use email authentication or add specific team members

---

## Local Development

To view the site locally:

```bash
# Using Python
cd vesperajewels
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## Placeholder Images

All product and hero images use Unsplash placeholders. To replace:

1. Replace image URLs in `index.html`
2. Or upload via Decap CMS admin panel
3. Recommended image sizes:
   - Hero: 1920x1080px minimum
   - Product thumbnails: 800x800px minimum
   - About section: 800x1000px minimum

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

© 2024 Vespera Jewels. All rights reserved.
