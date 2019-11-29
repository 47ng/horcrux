import { RequestHandler, json, send } from 'micro'
import requestHandler, {
  Request,
  RequestBody,
  Response
} from '@47ng/horcrux-handler'

export { horcruxName } from '@47ng/horcrux-handler'

export const createHorcrux = (): RequestHandler => {
  return async (req, res) => {
    let body: RequestBody | undefined = undefined
    try {
      body = (await json(req)) as RequestBody
    } catch (error) {
      // Pass empty body to the handler
    }

    const request: Request = {
      method: req.method || 'UNKNOWN',
      body
    }
    const response: Response = (code, data) => send(res, code, data)
    await requestHandler(request, response)
  }
}

export default createHorcrux
