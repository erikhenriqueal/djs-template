export function reduceSeconds(seconds: number): string {
  if (isNaN(seconds)) return '--:--'
  const days = Math.floor(seconds / 60 / 60 / 24)
  const hours = Math.floor(seconds / 60 / 60) - (days * 24)
  const minutes = Math.floor(seconds / 60) - ((days * 24 + hours) * 60)

  const timeString = [
    days.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
    hours.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
    minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 }),
    (seconds % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })
  ]

  if (days > 0) return timeString.join(':')
  else if (hours > 0) return timeString.slice(1).join(':')
  else return timeString.slice(2).join(':')
}