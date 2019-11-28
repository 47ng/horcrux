import { generateTotpCode, generateTotpSecret, verifyTotpCode } from './totp'

describe('TOTP', () => {
  test('generate and verify codes', () => {
    const secret = generateTotpSecret()
    const code = generateTotpCode(secret)
    const verify = () => verifyTotpCode(code, secret)
    expect(verify).not.toThrow()
  })
  test('verify an invalid code', () => {
    const secret = generateTotpSecret()
    const code = generateTotpCode(secret)
    const badCode = ((parseInt(code, 10) + 1) % 999999)
      .toString(10)
      .padStart(6, '0')
    const verify = () => verifyTotpCode(badCode, secret)
    expect(verify).toThrow()
  })
})
