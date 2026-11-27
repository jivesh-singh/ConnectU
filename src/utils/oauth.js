export function getOAuthError({ search, hash }) {
  const query = new URLSearchParams(search)
  const fragment = new URLSearchParams(hash.slice(1))
  const error = query.get('error') || fragment.get('error')
  const code = query.get('error_code') || fragment.get('error_code')

  if (code === 'access_denied' || error === 'access_denied') {
    return 'Google sign-in was canceled or denied for this account. Try again or choose another Google account.'
  }

  if (error || code || query.has('error_description') || fragment.has('error_description')) {
    return 'Google sign-in couldn’t finish. Reopen ConnectU in your browser and try again.'
  }

  return ''
}
