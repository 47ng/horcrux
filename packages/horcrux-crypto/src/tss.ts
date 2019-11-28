import * as tss from '@stablelib/tss'
import { Encoding, encoders, decoders } from './codec'

/**
 * Split a secret into a given amount of shards.
 * Will throw if anything goes wrong.
 *
 * @param secret The secret to split
 * @param numShards How many pieces to split into
 * @param threshold How many pieces are needed (min) to re-assemble the secret
 * @param encoding Encoding for the secret and the shards
 */
export const splitSecret = (
  secret: string,
  numShards: number,
  threshold: number,
  encoding: Encoding = 'base64'
) => {
  const encode = encoders[encoding]
  const decode = decoders[encoding]
  const shards = tss.split(decode(secret), threshold, numShards)
  return shards.map(shard => encode(shard))
}

/**
 * Try to re-assemble the original secret from shards.
 * Will throw if anything goes wrong.
 *
 * @param shards Any number of shards
 * @param encoding Encoding for the shards and the output
 * @returns The secret in the same encoding as the shards
 */
export const assembleSecret = (
  shards: string[],
  encoding: Encoding = 'base64'
) => {
  const encode = encoders[encoding]
  const decode = decoders[encoding]
  const secret = tss.combine(shards.map(shard => decode(shard)))
  return encode(secret)
}
