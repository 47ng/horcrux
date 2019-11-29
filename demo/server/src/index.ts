import micro from 'micro'
import { createHorcrux, horcruxName } from '@47ng/horcrux-adapter-micro'

const horcrux = createHorcrux()

const port = process.env.PORT || 3000
micro(horcrux).listen(port, () => {
  console.info(`Horcrux ${horcruxName} running on http://localhost:${port}`)
})
