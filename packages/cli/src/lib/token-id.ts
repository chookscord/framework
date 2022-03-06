function tokenToAppId(token: string): string {
  try {
    const b64id = token.split('.')[0]
    return Buffer.from(b64id, 'base64').toString()
  } catch {
    throw new Error('An invalid token format was provided!')
  }
}

export default tokenToAppId
