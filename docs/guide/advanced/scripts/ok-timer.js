export function chooksOnLoad() {
  console.log('Starting timer!')
  const interval = setInterval(() => {
    console.log('Hello, world!')
  }, 1000)

  return () => {
    console.log('Turning off timer!')
    clearInterval(interval)
  }
}
