export function random(a: number, b: number): number {
  const x = Math.max(a, b)
  const y = Math.min(a, b)
  return Math.random() * (x - y) + y
}

export function randomint(a: number, b: number): number {
  const x = Math.floor(Math.max(a, b))
  const y = Math.floor(Math.min(a, b))
  return Math.floor(Math.random() * (x - y + 1) + y)
}