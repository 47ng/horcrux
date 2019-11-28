import nacl from 'tweetnacl'
import { b64 } from './codec'
import { generateTotpSecret } from './totp'
import {
  generateRequest,
  verifyRequestAndGenerateResponse,
  verifyResponse,
  HorcruxProtectedState,
  HorcruxPrivateState
} from './handshake'

describe('Horcrux Handshake', () => {
  test('complete flow', async () => {
    const serverEd25519KeyPair = nacl.sign.keyPair()
    const clientEd25519KeyPair = nacl.sign.keyPair()

    const name = 'foo'
    const identifier = 'bar'
    const totpSecret = generateTotpSecret()

    const clientState: HorcruxProtectedState = {
      name,
      identifier,
      totpSecret,
      ed25519Public: b64.encode(serverEd25519KeyPair.publicKey),
      ed25519Secret: b64.encode(clientEd25519KeyPair.secretKey)
    }
    const serverState: HorcruxPrivateState = {
      name,
      identifier,
      totpSecret,
      ed25519Public: b64.encode(clientEd25519KeyPair.publicKey),
      ed25519Secret: b64.encode(serverEd25519KeyPair.secretKey),
      secretShard: 'secret stuff'
    }

    const {
      params,
      encryptionKeyPair: clientEncryptionKeyPair
    } = await generateRequest(clientState)

    const response = await verifyRequestAndGenerateResponse(params, serverState)
    const received = await verifyResponse(
      response,
      clientState,
      clientEncryptionKeyPair
    )
    expect(received).toEqual(serverState.secretShard)
  })

  describe('Attacks', () => {
    test('invalid TOTP', async () => {
      const serverEd25519KeyPair = nacl.sign.keyPair()
      const clientEd25519KeyPair = nacl.sign.keyPair()

      const name = 'foo'
      const identifier = 'bar'
      const totpSecretA = generateTotpSecret()
      const totpSecretB = generateTotpSecret()

      const clientState: HorcruxProtectedState = {
        name,
        identifier,
        totpSecret: totpSecretA,
        ed25519Public: b64.encode(serverEd25519KeyPair.publicKey),
        ed25519Secret: b64.encode(clientEd25519KeyPair.secretKey)
      }
      const serverState: HorcruxPrivateState = {
        name,
        identifier,
        totpSecret: totpSecretB,
        ed25519Public: b64.encode(clientEd25519KeyPair.publicKey),
        ed25519Secret: b64.encode(serverEd25519KeyPair.secretKey),
        secretShard: 'secret stuff'
      }

      const { params } = await generateRequest(clientState)

      await expect(
        verifyRequestAndGenerateResponse(params, serverState)
      ).rejects.toThrow('Invalid TOTP')
    })

    test('invalid request signature', async () => {
      const serverEd25519KeyPair = nacl.sign.keyPair()
      const clientEd25519KeyPairA = nacl.sign.keyPair()
      const clientEd25519KeyPairB = nacl.sign.keyPair()

      const name = 'foo'
      const identifier = 'bar'
      const totpSecret = generateTotpSecret()

      const clientState: HorcruxProtectedState = {
        name,
        identifier,
        totpSecret,
        ed25519Public: b64.encode(serverEd25519KeyPair.publicKey),
        ed25519Secret: b64.encode(clientEd25519KeyPairA.secretKey)
      }
      const serverState: HorcruxPrivateState = {
        name,
        identifier,
        totpSecret,
        ed25519Public: b64.encode(clientEd25519KeyPairB.publicKey),
        ed25519Secret: b64.encode(serverEd25519KeyPair.secretKey),
        secretShard: 'secret stuff'
      }

      const { params } = await generateRequest(clientState)

      await expect(
        verifyRequestAndGenerateResponse(params, serverState)
      ).rejects.toThrow('Invalid signature')
    })

    test('invalid response signature', async () => {
      const serverEd25519KeyPairA = nacl.sign.keyPair()
      const serverEd25519KeyPairB = nacl.sign.keyPair()
      const clientEd25519KeyPair = nacl.sign.keyPair()

      const name = 'foo'
      const identifier = 'bar'
      const totpSecret = generateTotpSecret()

      const clientState: HorcruxProtectedState = {
        name,
        identifier,
        totpSecret,
        ed25519Public: b64.encode(serverEd25519KeyPairA.publicKey),
        ed25519Secret: b64.encode(clientEd25519KeyPair.secretKey)
      }
      const serverState: HorcruxPrivateState = {
        name,
        identifier,
        totpSecret,
        ed25519Public: b64.encode(clientEd25519KeyPair.publicKey),
        ed25519Secret: b64.encode(serverEd25519KeyPairB.secretKey),
        secretShard: 'secret stuff'
      }

      const {
        params,
        encryptionKeyPair: clientEncryptionKeyPair
      } = await generateRequest(clientState)

      const response = await verifyRequestAndGenerateResponse(
        params,
        serverState
      )
      await expect(
        verifyResponse(response, clientState, clientEncryptionKeyPair)
      ).rejects.toThrow('Invalid signature')
    })

    test('invalid response encryption', async () => {
      const serverEd25519KeyPair = nacl.sign.keyPair()
      const clientEd25519KeyPair = nacl.sign.keyPair()

      const name = 'foo'
      const identifier = 'bar'
      const totpSecret = generateTotpSecret()

      const clientState: HorcruxProtectedState = {
        name,
        identifier,
        totpSecret,
        ed25519Public: b64.encode(serverEd25519KeyPair.publicKey),
        ed25519Secret: b64.encode(clientEd25519KeyPair.secretKey)
      }
      const serverState: HorcruxPrivateState = {
        name,
        identifier,
        totpSecret,
        ed25519Public: b64.encode(clientEd25519KeyPair.publicKey),
        ed25519Secret: b64.encode(serverEd25519KeyPair.secretKey),
        secretShard: 'secret stuff'
      }

      const { params } = await generateRequest(clientState)
      const response = await verifyRequestAndGenerateResponse(
        params,
        serverState
      )
      const badKeyPair = nacl.box.keyPair()

      await expect(
        verifyResponse(response, clientState, badKeyPair)
      ).rejects.toThrow('Failed to decrypt')
    })
  })
})
