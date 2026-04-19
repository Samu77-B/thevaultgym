/**
 * Starts GitHub OAuth for Decap CMS. Deployed as a Cloudflare Pages Function at /api/auth.
 * Requires env GITHUB_CLIENT_ID on the Pages project.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const client_id = env.GITHUB_CLIENT_ID;

  if (!client_id) {
    return new Response('GITHUB_CLIENT_ID is not configured', { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const redirectUrl = new URL('https://github.com/login/oauth/authorize');
    redirectUrl.searchParams.set('client_id', client_id);
    redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
    redirectUrl.searchParams.set('scope', 'repo user');
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    redirectUrl.searchParams.set('state', state);
    return Response.redirect(redirectUrl.href, 302);
  } catch (error) {
    console.error(error);
    return new Response(error instanceof Error ? error.message : String(error), { status: 500 });
  }
}
