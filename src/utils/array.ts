import { randomint } from './number'

export function uniques<T>(array: T[]): T[] {
  const uniqueValues: T[] = []
  return array.filter(v => {
    if (!uniqueValues.includes(v)) {
      uniqueValues.push(v)
      return true
    }
    return false
  })
}

export function shuffle<T>(array: T[]): T[] {
  const arrayCopy = array.slice()
  const shuffled = []
  for (let i = 0; i < array.length; i++) {
    const index = randomint(0, arrayCopy.length - 1)
    shuffled.push(arrayCopy.splice(index, 1)[0])
  }
  return shuffled
}