function timer(): () => number {
  const start = process.hrtime()
  return () => {
    const [s, ns] = process.hrtime(start)
    return s * 1e3 + ns / 1e6
  }
}

export default timer
