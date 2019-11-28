import nacl from 'tweetnacl'
import { hashString, hashStringRaw } from './hash'
import { b64, Encoding } from './codec'

/**
 * Sign the SHA-256 hash of a string using Ed25519.
 *
 * Output is base64url-encoded
 *
 * @param input - The string to hash and sign
 * @param secretKey - Ed25519 secret key, base64url-encoded or from a keyPair
 * @param encoding - Encoding of the input string, defaults to UTF-8
 */
export const signStringHash = async (
  input: string,
  secretKey: string | Uint8Array,
  encoding: Encoding = 'utf8'
): Promise<string> => {
  const hash = await hashStringRaw(input, encoding)
  const signature = nacl.sign(
    hash,
    typeof secretKey === 'string' ? b64.decode(secretKey) : secretKey
  )
  return b64.encode(signature)
}

/**
 * Verify the signature of a SHA-256 hash of a string using Ed25519.
 *
 * @param input - The string to hash and verify signature against
 * @param signature - A signed hash of the input to verify
 * @param publicKey - Ed25519 public key, base64url-encoded or from a keyPair
 * @param encoding - Encoding of the input string, defaults to UTF-8
 */
export const verifyStringHashSignature = async (
  input: string,
  signature: string,
  publicKey: string | Uint8Array,
  encoding: Encoding = 'utf8'
) => {
  const receivedHash = nacl.sign.open(
    b64.decode(signature),
    typeof publicKey === 'string' ? b64.decode(publicKey) : publicKey
  )
  if (!receivedHash) {
    throw new Error('Invalid signature')
  }
  const expectedHash = await hashString(input, encoding, 'base64')
  if (b64.encode(receivedHash) !== expectedHash) {
    throw new Error('Invalid signature')
  }
  // All good
  return expectedHash
}
