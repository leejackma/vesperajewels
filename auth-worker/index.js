export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Decap CMS GitHub backend OAuth flow
    if (url.pathname === '/auth') {
      // Step 1: Redirect to GitHub for authorization
      const provider = url.searchParams.get('provider');
      const siteId = url.searchParams.get('site_id');
      const scope = url.searchParams.get('scope') || 'repo';
      
      if (!url.searchParams.get('code')) {
        const redirectUri = `https://${url.hostname}/auth`;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${siteId || ''}`;
        return Response.redirect(githubAuthUrl, 301);
      }

      // Step 2: Handle callback with code
      const code = url.searchParams.get('code');
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const data = await response.json();
      
      // Return HTML that posts the token back to the CMS window
      const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  function receiveMessage(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'authorization') {
      localStorage.setItem('decap-cms-user', JSON.stringify(data));
      window.close();
    }
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage(JSON.stringify({
    type: 'authorization',
    authorization: {
      token: '${data.access_token}',
      provider: 'github'
    },
    code: '${code}'
  }), '*');
  window.close();
})();
</script>
</body>
</html>`;
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    return new Response('Decap CMS OAuth Proxy', { headers: corsHeaders });
  },
};
