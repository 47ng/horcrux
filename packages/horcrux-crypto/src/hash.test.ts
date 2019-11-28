import { hashString } from './hash'

describe('Hash', () => {
  test('SHA256 test vector', async () => {
    expect(await hashString('abc', 'utf8', 'hex')).toEqual(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
    expect(await hashString('', 'utf8', 'hex')).toEqual(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
    expect(
      await hashString(
        'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        'utf8',
        'hex'
      )
    ).toEqual(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
    )
    expect(
      await hashString(
        'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu',
        'utf8',
        'hex'
      )
    ).toEqual(
      'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1'
    )
  })
})
