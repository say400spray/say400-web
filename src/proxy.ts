import { type NextRequest, NextResponse } from 'next/server'

import { PREVIEW_COOKIE, previewPassword, previewToken } from './lib/previewAccess'

/** Keeps a shared preview private: every page asks for the preview password first. */
export async function proxy(request: NextRequest) {
  const password = previewPassword()
  if (!password) return NextResponse.next()

  const cookie = request.cookies.get(PREVIEW_COOKIE)?.value
  if (cookie && cookie === (await previewToken(password))) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  const { pathname, search } = request.nextUrl
  const url = request.nextUrl.clone()
  url.pathname = '/preview-login'
  url.search = `?next=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(url)
}

export const config = {
  // the login page, Mollie's webhook and static assets stay reachable
  matcher: ['/((?!preview-login|api/webhooks|_next/static|_next/image|brand/|favicon.ico).*)'],
}
