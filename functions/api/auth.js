export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');

  // Step 1: No code yet, redirect to GitHub
  if (!code) {
    const redirectUri = `https://vesperajewels.com/api/auth`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=Ov23liE11SMYYjxT318Z&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
    return Response.redirect(githubAuthUrl, 301);
  }

  // Step 2: Have code, exchange for token
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

  // Step 3: Store token in localStorage and notify opener via both postMessage and localStorage bridge
  const token = data.access_token;
  const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  var authData = JSON.stringify({type:'authorization',authorization:{token:'${token}',provider:'github'},code:'${code}'});
  
  // Try postMessage first
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(authData, '*');
    }
  } catch(e) {}
  
  // Also store in localStorage as bridge (same origin)
  try {
    localStorage.setItem('decap-cms-auth-result', authData);
    localStorage.setItem('decap-cms-user', JSON.stringify({token:'${token}',provider:'github'}));
  } catch(e) {}
  
  // Try postMessage again after a delay
  setTimeout(function() {
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(authData, '*');
      }
    } catch(e) {}
    window.close();
  }, 1000);
  
  document.body.innerHTML = '<p style=\"text-align:center;padding-top:40px;font-family:sans-serif;color:#C5A467;\">Authorization successful! Closing...</p>';
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
