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

  // Step 3: Redirect back to admin page with token in URL hash
  return Response.redirect(`https://vesperajewels.com/admin/#access_token=${data.access_token}`, 301);
}
