import nacl from 'tweetnacl'
import { encryptNaClBox, decryptNaClBox } from './ciphers'

describe('Ciphers', () => {
  describe('TweetNaCl Box', () => {
    test('serde', () => {
      const expected = 'Hello, World !'
      const keyPair = nacl.box.keyPair()
      const encryptd = encryptNaClBox(expected, keyPair.publicKey)
      const received = decryptNaClBox(encryptd, keyPair.secretKey)
      expect(received).toEqual(expected)
    })
    test('incorrect decryption key should throw', () => {
      const expected = 'Hello, World !'
      const keyPairA = nacl.box.keyPair()
      const keyPairB = nacl.box.keyPair()
      const encryptd = encryptNaClBox(expected, keyPairA.publicKey)
      const shouldThrow = () => decryptNaClBox(encryptd, keyPairB.secretKey)
      expect(shouldThrow).toThrow('Failed to decrypt')
    })

    test('using secret key for encryption should throw', () => {
      // Note: it would be better if it threw at encryption time though,
      // but since they are the same length, it's hard to detect.
      const expected = 'Hello, World !'
      const keyPair = nacl.box.keyPair()
      const encryptd = encryptNaClBox(expected, keyPair.secretKey)
      const shouldThrow = () => decryptNaClBox(encryptd, keyPair.secretKey)
      expect(shouldThrow).toThrow('Failed to decrypt')
    })

    test('using public key for decryption should throw', () => {
      const expected = 'Hello, World !'
      const keyPair = nacl.box.keyPair()
      const encryptd = encryptNaClBox(expected, keyPair.publicKey)
      const shouldThrow = () => decryptNaClBox(encryptd, keyPair.publicKey)
      expect(shouldThrow).toThrow('Failed to decrypt')
    })
  })
})
