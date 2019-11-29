import nacl from 'tweetnacl'
import { b64 } from './codec'
import { generateTotpCode, verifyTotpCode, generateTotpSecret } from './totp'
import { encryptNaClBox, decryptNaClBox } from './ciphers'
import { signStringHash, verifyStringHashSignature } from './signature'
import nanoid from 'nanoid'

export interface HorcruxPublicState {
  // Public parameters
  name: string
  identifier: string
  ed25519Public: string
}

export interface HorcruxProtectedState extends HorcruxPublicState {
  totpSecret: string
  ed25519Secret: string
}

/**
 * These are the things only known by the Horcrux provider
 */
export interface HorcruxPrivateState extends HorcruxProtectedState {
  secretShard: string
}

// --

export interface HorcruxRequestParams {
  totp: string
  sig: string // Ed25519 signature of SHA256(all public parameters + TOTP code)
  pub: string // X25519 public key to use for encrypting the response
}

export interface HorcruxResponse {
  message: string // X25519 public key
  sig: string
}

// --

export interface HorcruxStatePair {
  clientState: HorcruxProtectedState
  serverState: HorcruxPrivateState
}

export const generateHorcrux = (
  secretShard: string,
  horcruxName: string,
  horcruxID: string = b64.encode(nacl.randomBytes(8))
): HorcruxStatePair => {
  const clientEd25519KeyPair = nacl.sign.keyPair()
  const serverEd25519KeyPair = nacl.sign.keyPair()
  const totpSecret = generateTotpSecret()
  return {
    serverState: {
      name: horcruxName,
      identifier: horcruxID,
      ed25519Public: b64.encode(clientEd25519KeyPair.publicKey),
      ed25519Secret: b64.encode(serverEd25519KeyPair.secretKey),
      totpSecret,
      secretShard
    },
    clientState: {
      name: horcruxName,
      identifier: horcruxID,
      ed25519Public: b64.encode(serverEd25519KeyPair.publicKey),
      ed25519Secret: b64.encode(clientEd25519KeyPair.secretKey),
      totpSecret
    }
  }
}

// --

export const generateRequest = async (state: HorcruxProtectedState) => {
  const totp = generateTotpCode(state.totpSecret)
  const encryptionKeyPair = nacl.box.keyPair()
  const pub = b64.encode(encryptionKeyPair.publicKey)
  const hashInput = [state.name, state.identifier, pub, totp].join('')
  const sig = await signStringHash(hashInput, state.ed25519Secret, 'utf8')

  const params: HorcruxRequestParams = {
    totp,
    sig,
    pub
  }
  return {
    params,
    encryptionKeyPair
  }
}

// --

export const verifyRequestAndGenerateResponse = async (
  params: HorcruxRequestParams,
  state: HorcruxPrivateState
): Promise<HorcruxResponse> => {
  // Verify the TOTP code first to slow attackers down
  verifyTotpCode(params.totp, state.totpSecret)

  // Verify the request signature
  const hashInput = [
    state.name,
    state.identifier,
    params.pub,
    params.totp
  ].join('')
  await verifyStringHashSignature(
    hashInput,
    params.sig,
    state.ed25519Public,
    'utf8'
  )

  // Generate the response
  const message = encryptNaClBox(state.secretShard, params.pub)
  const sig = await signStringHash(message, state.ed25519Secret, 'utf8')
  return {
    message,
    sig
  }
}

/**
 * Verify the response and extract the secret shard.
 */
export const verifyResponse = async (
  response: HorcruxResponse,
  state: HorcruxProtectedState,
  encryptionKeyPair: nacl.BoxKeyPair
): Promise<string> => {
  // Verify signature first
  await verifyStringHashSignature(
    response.message,
    response.sig,
    state.ed25519Public,
    'utf8'
  )

  // Signature is valid, decrypt the message:
  return decryptNaClBox(response.message, encryptionKeyPair.secretKey)
}
