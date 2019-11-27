export interface RequestBody {}

export interface Request {
  method: string // Must be POST
  body: RequestBody
}

export interface ResponseBody {
  horcrux: string
  sig: string
}

export type Response = (status: number, data: any) => void

// --

const requestHandler = async (req: Request, res: Response) => {
  // todo: Allow OPTIONS ?
  if (req.method !== 'POST') {
    return res(405, {
      error: `Only POST is allowed`
    })
  }
  const body: ResponseBody = {
    horcrux: 'todo: Implement me.',
    sig: 'todo: Implement me.'
  }
  return res(200, body)
}

export default requestHandler
