export const URL_REGEXP = /^(http[s]?:\/\/)?([a-zA-Z\d-]+(?:\.[a-zA-Z\d-]+)+)(:\d{1,5})?((?:\/[\w.-]*)*)?(\?\S*)?(#\S*)$/i

export function parseURL(url: string): {
  method: 'http' | 'https' | null,
  domain: string,
  port: number | null,
  path: string,
  params: { [key: string]: string; } | null,
  hash: string | null
} | null {
  if (typeof url !== 'string' || !URL_REGEXP.test(url)) return null
  const matcher = url.match(URL_REGEXP) as RegExpMatchArray
  const method = matcher[1] ? matcher[1].slice(0, -3) as 'http' | 'https' : null
  const domain = matcher[2]
  const port = matcher[3] ? Number(matcher[3].slice(1)) : null
  const path = matcher[4] || '/'
  const params = matcher[5] ? Object.fromEntries(matcher[5].slice(1).split('&').map(p => {
    const [k, ...v] = p.split('=')
    return [k, v.join('=')]
  })) : null
  const hash = matcher[6] && matcher[6].length > 1 ? matcher[6].slice(1) : null

  const parsed = {
    method,
    domain,
    port,
    path,
    params,
    hash
  }

  parsed.toString = function() {
    const args = [
      this.method ? `${this.method}://` : '',
      this.domain,
      this.port ? `:${this.port}` : '',
      this.path,
      this.params ? `?${Object.entries(this.params).map(([k, v]) => `${k}=${v}`).join('&')}` : '',
      this.hash ? `#${this.hash}` : ''
    ]
    return args.join('')
  }

  return parsed
}

export function clearURL(url: string): string {
  if (url.startsWith('http://')) url = url.slice(7)
  if (url.startsWith('https://')) url = url.slice(8)

  return url.trim()
}

export function matchURLs(urlA: string, urlB: string): boolean {
  if (!URL_REGEXP.test(urlA) || !URL_REGEXP.test(urlB)) return false
  
  const cleanA = clearURL(urlA)
  const cleanB = clearURL(urlB)
  
  return cleanA === cleanB
}