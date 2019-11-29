import dotenv from 'dotenv'
import { findHorcruxes, recomposeSecret } from '@47ng/horcrux-client'

const main = async () => {
  // Not called automatically on the client
  dotenv.config()

  const horcruxes = findHorcruxes()
  const secret = await recomposeSecret(horcruxes)
  console.log(secret)
}

main()
