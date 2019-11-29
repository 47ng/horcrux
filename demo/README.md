# Horcrux Demo

To run the demo:

1. Setup the repository:

```
$ yarn && lerna bootstrap && lerna link
```

2. Start the servers:

```
$ cd demo/server
$ yarn start
```

3. Start the client in another terminal, which will ask the servers for their
   shard and recompose the secret (`supersecret`):

```
$ cd demo/client
$ yarn start
```
