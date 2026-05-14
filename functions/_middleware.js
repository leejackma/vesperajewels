// Cloudflare Pages Function - Block mainland China IP access
// Checks CF-IPCountry header (set by Cloudflare for all plans)

const BLOCKED_COUNTRIES = ['CN'];

const BLOCK_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Unavailable</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FAFAF8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
            text-align: center;
            padding: 40px 20px;
            max-width: 480px;
        }
        .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            border-radius: 50%;
            background: #F5F0EB;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .icon svg {
            width: 32px;
            height: 32px;
            stroke: #C5A467;
            fill: none;
            stroke-width: 1.5;
        }
        h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        p {
            font-size: 14px;
            color: #8A8A8A;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
        </div>
        <h1>Access Unavailable</h1>
        <p>We're sorry, but our website is currently not available in your region. For inquiries, please contact us at <a href="mailto:xiaokou20260514@coze.email" style="color:#C5A467;">xiaokou20260514@coze.email</a></p>
    </div>
</body>
</html>
`;

export async function onRequest(context) {
    const { request, next } = context;
    
    // Get country from Cloudflare header
    const country = request.headers.get('CF-IPCountry');
    
    if (country && BLOCKED_COUNTRIES.includes(country.toUpperCase())) {
        return new Response(BLOCK_PAGE, {
            status: 451, // 451 Unavailable For Legal Reasons
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'no-store'
            }
        });
    }
    
    // Allow all other requests
    return next();
}
