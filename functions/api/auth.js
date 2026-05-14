export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');

  // Step 1: No code, redirect to GitHub
  if (!code) {
    const redirectUri = `https://vesperajewels.com/api/auth`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=Ov23liE11SMYYjxT318Z&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
    return Response.redirect(githubAuthUrl, 301);
  }

  // Step 2: Exchange code for token
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: 'Ov23liE11SMYYjxT318Z',
      client_secret: '1fa6dcc99e35997e93fd730249499b19d5079f67',
      code: code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return new Response('OAuth Error: ' + data.error, { status: 400 });
  }

  // Step 3: Store token in localStorage via HTML, then close popup
  const token = data.access_token;
  const html = `<!DOCTYPE html>
<html>
<head><title>Authorization Complete</title></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;background:#FAFAF8;color:#C5A467;">
<div style="text-align:center">
<h2>Authorization Successful!</h2>
<p>You can close this window.</p>
</div>
<script>
(function() {
  var token = '${token}';
  var authObj = {token: token, provider: 'github'};
  var msg = JSON.stringify({type:'authorization', authorization: authObj});
  
  // Store in localStorage for same-origin access
  try { localStorage.setItem('decap-cms-user', JSON.stringify(authObj)); } catch(e) {}
  try { localStorage.setItem('decap_cms_oauth_result', msg); } catch(e) {}
  
  // Try postMessage
  try { if (window.opener && !window.opener.closed) { window.opener.postMessage(msg, '*'); } } catch(e) {}
  
  // Close after delay
  setTimeout(function() { try { window.close(); } catch(e) {} }, 2000);
})();
</script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
