import tokenToAppId from '../src/lib/token-id'

test('token to app id', () => {
  const token = 'ODUwMzgwOTg2NTY2ODM2MjM0.YLo5Ag.v5Mgj4RykD9Y7c4lONOo9Fl1Syg'
  expect(tokenToAppId(token)).toBe('850380986566836234')
})
