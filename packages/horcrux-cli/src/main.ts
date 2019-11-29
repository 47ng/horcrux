import program from 'commander'
import { splitSecret, generateHorcrux } from '@47ng/horcrux-crypto'
import { encodeStateEnv, audiences } from '@47ng/horcrux-env'
import { HorcruxList } from '@47ng/horcrux-client'

// --

// program.command('providers', 'About providers')

program.command('split <secret>').action(async secret => {
  const horcruxes = [
    { name: 'foo', url: 'http://localhost:3001' },
    { name: 'bar', url: 'http://localhost:3002' },
    { name: 'egg', url: 'http://localhost:3003' }
  ]
  const clientConfig: HorcruxList = {
    numShards: 3,
    threshold: 2,
    servers: []
  }
  const shards = splitSecret(
    secret,
    clientConfig.numShards,
    clientConfig.threshold,
    'utf8'
  )

  clientConfig.servers = shards.map((s, i) => {
    const { clientState, serverState } = generateHorcrux(s, horcruxes[i].name)
    const env = encodeStateEnv(
      serverState,
      audiences.server,
      serverState.identifier
    )
    console.log(`${horcruxes[i].name}: ${env}`)
    return {
      url: horcruxes[i].url,
      state: clientState
    }
  })
  const env = encodeStateEnv(clientConfig, audiences.client, 'demo')
  console.log(`Client: ${env}`)
})

program.name('horcrux').parse(process.argv)
