import {
  verifyRequestAndGenerateResponse,
  HorcruxRequestParams,
  HorcruxResponse
} from '@47ng/horcrux-crypto'
import { configureHandlerEnvironment } from '@47ng/horcrux-env'

export type RequestBody = HorcruxRequestParams

export interface Request {
  method: string // Must be POST
  body?: RequestBody
}

export interface ErrorResponse {
  error: string
  details?: string
}

export type Response = (
  status: number,
  data: HorcruxResponse | ErrorResponse
) => void

// --

const state = configureHandlerEnvironment()

export const horcruxName = state.name

const requestHandler = async (req: Request, res: Response) => {
  // todo: Allow OPTIONS ?
  if (req.method !== 'POST') {
    return res(405, {
      error: `Only POST is allowed`
    })
  }
  if (!req.body) {
    return res(400, {
      error: `Missing JSON body`
    })
  }

  try {
    const response = await verifyRequestAndGenerateResponse(req.body, state)
    return res(200, response)
  } catch (error) {
    // todo: Forward better/known status codes
    if (error.message === 'Invalid TOTP code') {
    }
    return res(403, {
      error: error.message
    })
  }
}

export default requestHandler
