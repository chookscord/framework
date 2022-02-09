function timer(): () => string {
  const start = process.hrtime()
  return () => {
    const [secs, nsecs] = process.hrtime(start)
    const msecs = Math.floor(nsecs / 1e6)

    return secs > 0
      ? `${secs + msecs / 1e3}s`
      : `${msecs}ms`
  }
}

export default timer
