import { RequestHandler, json, send } from 'micro'
import requestHandler, { Request, Response } from '@47ng/horcrux-handler'

export const createHorcrux = (): RequestHandler => {
  return async (req, res) => {
    const request: Request = {
      method: req.method || 'UNKNOWN',
      body: json(req)
    }
    const response: Response = (code, data) => send(res, code, data)
    await requestHandler(request, response)
  }
}

export default createHorcrux
