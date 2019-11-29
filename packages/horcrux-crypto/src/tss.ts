import nacl from 'tweetnacl'
import * as tss from '@stablelib/tss'
import { Encoding, encoders, decoders, b64 } from './codec'

/**
 * Split a secret into a given amount of shards.
 * Will throw if anything goes wrong.
 *
 * @param secret The secret to split
 * @param numShards How many pieces to split into
 * @param threshold How many pieces are needed (min) to re-assemble the secret
 * @param encoding Input encoding for the secret
 */
export const splitSecret = (
  secret: string,
  numShards: number,
  threshold: number,
  encoding: Encoding = 'utf8'
) => {
  const decode = decoders[encoding]
  const identifier = nacl.randomBytes(16)
  const shards = tss.split(decode(secret), threshold, numShards, identifier)
  return shards.map(shard => b64.encode(shard))
}

/**
 * Try to re-assemble the original secret from shards.
 * Will throw if anything goes wrong.
 *
 * @param shards Any number of shards
 * @param encoding Encoding for the output
 */
export const assembleSecret = (
  shards: string[],
  encoding: Encoding = 'utf8'
) => {
  const encode = encoders[encoding]
  const secret = tss.combine(shards.map(shard => b64.decode(shard)))
  return encode(secret)
}
