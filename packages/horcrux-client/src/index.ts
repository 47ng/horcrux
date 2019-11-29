import axios, { AxiosResponse, CancelToken } from 'axios'
import {
  HorcruxProtectedState,
  generateRequest,
  assembleSecret,
  HorcruxResponse,
  HorcruxRequestParams,
  verifyResponse
} from '@47ng/horcrux-crypto'
import { configureClientEnvironment } from '@47ng/horcrux-env'

export interface HorcruxServer {
  url: string
  state: HorcruxProtectedState
}

export interface HorcruxList {
  numShards: number
  threshold: number
  servers: HorcruxServer[]
}

export const findHorcruxes = (): HorcruxList => {
  return configureClientEnvironment<HorcruxList>()
}

interface RequestStatus {
  name: string
  shard?: string
  error?: Error
}

const sendServerRequest = async (
  server: HorcruxServer,
  cancelToken: CancelToken,
  timeout: number = 60 * 1000
) => {
  cancelToken.throwIfRequested()
  type Req = HorcruxRequestParams
  type Res = AxiosResponse<HorcruxResponse & { error: string }>
  const send = (async () => {
    // return Math.random() > 0.5 ? server.state.identifier : undefined
    const { params, encryptionKeyPair } = await generateRequest(server.state)
    const res = await axios.post<Req, Res>(server.url, params, {
      cancelToken
    })
    if (res.data.error) {
      throw new Error(res.data.error)
    }
    return await verifyResponse(res.data, server.state, encryptionKeyPair)
  })()
  const cancellableTimeout = async () => {
    return new Promise<never>((_, reject) => {
      const t = setTimeout(() => {
        reject(new Error('Timed out'))
      }, timeout)
      cancelToken.promise.then(() => clearTimeout(t))
      send.then(() => clearTimeout(t)).catch(() => clearTimeout(t))
    })
  }

  return await Promise.race([send, cancellableTimeout()])
}

export const recomposeSecret = async (horcruxes: HorcruxList) => {
  if (horcruxes.servers.length < horcruxes.threshold) {
    throw new Error(
      `Not enough horcrux servers: ${horcruxes.threshold} are required, but only ${horcruxes.servers.length} were provided.`
    )
  }

  let numReached = 0

  const source = axios.CancelToken.source()

  const results: RequestStatus[] = await Promise.all(
    horcruxes.servers.map(async server => {
      try {
        const shard = await sendServerRequest(server, source.token)
        numReached += 1
        // console.log(`Reached ${numReached} of ${horcruxes.threshold}`)
        if (numReached >= horcruxes.threshold) {
          source.cancel('Cancelled (enough shards collected)')
        }
        return {
          name: server.state.name,
          shard
        }
      } catch (error) {
        if (error.response) {
          return {
            name: server.state.name,
            error: error.response.data.error
          }
        }
        return {
          name: server.state.name,
          error: error
        }
      }
    })
  )

  const longestName = Math.max(
    ...horcruxes.servers.map(s => s.state.name.length)
  )

  const numErrors = results.reduce(
    (sum, res) => sum + (!!res.error || !res.shard ? 1 : 0),
    0
  )

  if (numErrors > horcruxes.numShards - horcruxes.threshold) {
    const text = [
      'Horcrux error: not enough shards available to recompose master secret:'
    ]
    results.forEach(({ name, shard, error }) => {
      const getStatus = () => {
        if (!error) {
          if (shard) {
            return '✅'
          } else {
            return '❌  Missing shard'
          }
        }
        if (error.message === 'Timed out') {
          return '🔻  No response (timeout)'
        }
        return `❌  ${error}`
      }
      text.push('  ' + name.padEnd(longestName + 4) + getStatus())
    })
    console.log(text.join('\n'))
    return
  }
  return assembleSecret(
    results.filter(r => !!r.shard).map(r => r.shard!),
    'utf8'
  )
}
