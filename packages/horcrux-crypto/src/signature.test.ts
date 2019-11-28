import nacl from 'tweetnacl'
import { signStringHash, verifyStringHashSignature } from './signature'

describe('Ed25519 Signature', () => {
  test('sign and verify UTF-8 messages', async () => {
    const provided = 'Hello, World !'
    const keyPair = nacl.sign.keyPair()
    const signature = await signStringHash(provided, keyPair.secretKey, 'utf8')
    const received = await verifyStringHashSignature(
      provided,
      signature,
      keyPair.publicKey,
      'utf8'
    )
    // Should not have thrown and returned the hash in base64url form:
    expect(received).toEqual('fUhpFbkUMyu1cw_XciI-iydpGeUe3KLeD4LF_BvOfrU=')
  })

  test('sign and verify base64 messages', async () => {
    const provided = 'BY5Fcm4PGJZZMhqMB3fAPnDSSScX2/PSpJgLz1WIK1E='
    const keyPair = nacl.sign.keyPair()
    const signature = await signStringHash(
      provided,
      keyPair.secretKey,
      'base64'
    )
    const received = await verifyStringHashSignature(
      provided,
      signature,
      keyPair.publicKey,
      'base64'
    )
    // Should not have thrown and returned the hash in base64url form:
    expect(received).toEqual('GkJZItrhYIwTzDGJf_WrzNvifqb6ladImYv605RY-S0=')
  })

  test('sign and verify hex messages', async () => {
    const provided = '2543150184508be826606da40ea19ee0f8b25467cb6d5a9480'
    const keyPair = nacl.sign.keyPair()
    const signature = await signStringHash(provided, keyPair.secretKey, 'hex')
    const received = await verifyStringHashSignature(
      provided,
      signature,
      keyPair.publicKey,
      'hex'
    )
    // Should not have thrown and returned the hash in base64url form:
    expect(received).toEqual('hJBHHJzqcsJb0Qtp5nSf3DfykS98L_JHmfxi0iAtP0g=')
  })

  test('invalid signature should throw', async () => {
    const provided = 'Hello, World !'
    const keyPairA = nacl.sign.keyPair()
    const keyPairB = nacl.sign.keyPair()
    const signature = await signStringHash(provided, keyPairA.secretKey, 'utf8')
    const shouldThrow = verifyStringHashSignature(
      provided,
      signature,
      keyPairB.publicKey,
      'utf8'
    )
    await expect(shouldThrow).rejects.toThrow('Invalid signature')
  })

  test('invalid message should throw', async () => {
    const provided = 'Hello, World !'
    const keyPair = nacl.sign.keyPair()
    const signature = await signStringHash(provided, keyPair.secretKey, 'utf8')
    const shouldThrow = verifyStringHashSignature(
      'not the same message',
      signature,
      keyPair.publicKey,
      'utf8'
    )
    await expect(shouldThrow).rejects.toThrow('Invalid signature')
  })
})
