function timer(): () => string {
  const start = process.hrtime()
  return () => {
    const [secs, nsecs] = process.hrtime(start)
    const msecs = Math.floor(nsecs / 1e6) / 1e3

    return secs > 0
      ? `${secs + msecs}s`
      : `${`${msecs}`.slice(2)}ms`
  }
}

export default timer
