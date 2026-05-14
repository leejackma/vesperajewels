export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') {
      if (!url.searchParams.get('code')) {
        const redirectUri = `https://vesperajewels-auth.leejackma.workers.dev/auth`;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=Ov23liE11SMYYjxT318Z&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
        return Response.redirect(githubAuthUrl, 301);
      }
      const code = url.searchParams.get('code');
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: 'Ov23liE11SMYYjxT318Z', client_secret: '1fa6dcc99e35997e93fd730249499b19d5079f67', code: code }),
      });
      const data = await response.json();
      if (data.error) {
        return new Response('Error: ' + data.error, { status: 400, headers: { 'Content-Type': 'text/plain' } });
      }
      const html = `<!DOCTYPE html><html><body><script>
(function(){
  if(window.opener){
    window.opener.postMessage(JSON.stringify({type:'authorization',authorization:{token:'${data.access_token}',provider:'github'}}),'*');
  }
  document.body.innerHTML='<h3>Authorization successful! You can close this window.</h3>';
})();
</script></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('OAuth Proxy');
  },
};
