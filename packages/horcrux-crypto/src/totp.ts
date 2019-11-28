import { TOTP } from 'otplib/core'
import { createDigest } from 'otplib/plugin-crypto'
import { b64 } from './codec'
import nacl from 'tweetnacl'

const totp = new TOTP({ createDigest })

export const generateTotpSecret = (length = 32) => {
  return b64.encode(nacl.randomBytes(length))
}

export const generateTotpCode = (secret: string) => {
  return totp.generate(secret)
}

export const verifyTotpCode = (code: string, secret: string) => {
  const verified = totp.check(code, secret)
  if (!verified) {
    throw new Error('Invalid TOTP code')
  }
}
