import { PREVIEW_COOKIE, previewPassword, previewToken } from '@/lib/previewAccess'
import { safePath, siteUrl } from '@/lib/site'

const page = (next: string, error = false) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Say400 — Private preview</title>
<meta property="og:title" content="Say400 — Private preview">
<meta property="og:description" content="Discreet men’s wellness. Tap to view the new website.">
<meta property="og:image" content="${siteUrl()}/brand/og-image.jpg">
<meta property="og:type" content="website">
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 30%,#2a2416,#070707 65%);color:#f4efe6;font-family:system-ui,sans-serif}
  form{width:min(340px,86vw);display:flex;flex-direction:column;gap:18px;text-align:center}
  img{width:180px;margin:0 auto 8px}
  p{margin:0;color:#a39d91;font-size:14px;letter-spacing:.04em}
  input{padding:14px 16px;border:1px solid rgba(237,200,114,.35);border-radius:999px;background:transparent;color:#f4efe6;font-size:16px;text-align:center}
  input:focus{outline:none;border-color:#f9cf73}
  button{padding:14px;border:0;border-radius:999px;background:linear-gradient(100deg,#966e2a,#f9cf73 38%,#d0a446 62%,#edc872);color:#120d04;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
  .error{color:#ef7a6f}
</style></head>
<body><form method="post">
  <img src="/brand/logo-full.svg" alt="say400">
  <p>Private preview. Please enter the password.</p>
  <input type="hidden" name="next" value="${next.replace(/"/g, '&quot;')}">
  <input type="password" name="password" placeholder="Password" autofocus required>
  ${error ? '<p class="error">Incorrect password.</p>' : ''}
  <button type="submit">View the site</button>
</form></body></html>`

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

export async function GET(request: Request) {
  const next = safePath(new URL(request.url).searchParams.get('next') ?? undefined, '/')
  return html(page(next))
}

export async function POST(request: Request) {
  const form = await request.formData()
  const next = safePath(String(form.get('next') ?? ''), '/')
  const password = previewPassword()
  if (!password) return Response.redirect(new URL(next, request.url), 303)
  if (String(form.get('password') ?? '') !== password) return html(page(next, true), 401)

  const secure = new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
  return new Response(null, {
    status: 303,
    headers: {
      Location: next,
      'Set-Cookie': `${PREVIEW_COOKIE}=${await previewToken(password)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
    },
  })
}
