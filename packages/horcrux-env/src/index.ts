import dotenv from 'dotenv'
import checkEnv from '@47ng/check-env'
import { b64, utf8, HorcruxPrivateState } from '@47ng/horcrux-crypto'

export const audiences = {
  client: 'horcrux-client',
  server: 'horcrux-server'
}

// --

const configureEnvironment = <T>(
  envName: string,
  audience: string,
  env: NodeJS.ProcessEnv = process.env
) => {
  checkEnv(
    {
      required: [envName]
    },
    env
  )
  return decodeStateEnv<T>(env[envName]!, audience)
}

// --

export const configureClientEnvironment = <ClientState>(
  env: NodeJS.ProcessEnv = process.env
) => {
  return configureEnvironment<ClientState>(
    'HORCRUX_CLIENT_CONFIG',
    audiences.client,
    env
  )
}

export const configureHandlerEnvironment = (
  env: NodeJS.ProcessEnv = process.env
) => {
  dotenv.config()
  return configureEnvironment<HorcruxPrivateState>(
    'HORCRUX_SERVER_CONFIG',
    audiences.server,
    env
  )
}

// --

export const encodeStateEnv = <T>(state: T, audience: string, id: string) => {
  const json = JSON.stringify(state)
  const base64 = b64.encode(utf8.encode(json))
  return ['v1', audience, id, base64].join('.')
}

export const decodeStateEnv = <T>(input: string, audience: string): T => {
  if (!input.startsWith('v1.')) {
    throw new Error('Unknown state environment format')
  }
  const [receivedAudience, _id, configBase64] = input.split('.').slice(1)
  if (audience !== receivedAudience) {
    throw new Error('Invalid state environment audience')
  }
  const json = utf8.decode(b64.decode(configBase64))
  return JSON.parse(json)
}
