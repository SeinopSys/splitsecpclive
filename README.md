# splitsecpclive

My sorry, hopeless attempt at trying to reverse engineer the network requests made by the game [Split/Second](https://store.steampowered.com/app/297860/SplitSecond/) when it's trying to connect to its original multiplayer servers that were shot down relatively soon after the game's launch.

I don't know why anyone would actually want to use this, but I figured I might as well share my findings.

The game is using a protocol called PRUDP to try and connect to a server that used to reside at `splitsecpclive.quazal.net` on port `31120`. The communication uses packets with 15-byte payloads. The game is using Quazal Net-Z for (at least) the online functionality.

## Packet layout

| Bytes | Description |
| ------ | ----------- |
| 1-2    | Direction (`3F31` = server to client, `313F` = client to server)
| 3    | Type |
| 4-14   | Uncharted territory (literally have no idea what's happening here) |
| 15     | Checksum (likely using a custom algorithm) |

## Identified message types

 * `0x20`: "Ping" request checking for the existence of a server
 * `0x08`: "After Init" request that contains some (seemingly random) data in the last 4 bytes before the checksum
 * `0x31`: Mystery request, contains two copies of the random data seen in the "After Init" message as well as another checksum (or a random flag?) right after the message type, padded in the middle with `0100`
 
## Running

 1. Add the line `127.0.0.1 splitsecpclive.quazal.net` to your hosts file (located at `C:\Windows\System32\drivers\etc\hosts`)<br>This is necessary to redirect requests addressed to the previously existing server to your machine
 1. Install dependencies with `npm install` then start the server using `npm start`
 1. Launch Split/Second and try to go online.
 
## Example outputs

```
LSTN 0.0.0.0:31120 (IPv4)
RECV <<< 3f3120000000000000000000000062 (15 bytes)
SEND >>> 313f20000000000000000000000062 (15 bytes)
RECV <<< 3f310800000000000000503b4c7697 (15 bytes)
SEND >>> 313f0800000000000000503b4c7697 (15 bytes)
RECV <<< 3f31310d503b4c760100503b4c761b (15 bytes)
????? received
CLSD
```

```
LSTN 0.0.0.0:31120 (IPv4)
RECV <<< 3f3120000000000000000000000062 (15 bytes)
SEND >>> 313f20000000000000000000000062 (15 bytes)
RECV <<< 3f3108000000000000002bc037bd29 (15 bytes)
SEND >>> 313f08000000000000002bc037bd29 (15 bytes)
RECV <<< 3f3131222bc037bd01002bc037bd54 (15 bytes)
????? received
CLSD
```

```
LSTN 0.0.0.0:31120 (IPv4)
RECV <<< 3f3120000000000000000000000062 (15 bytes)
SEND >>> 313f20000000000000000000000062 (15 bytes)
RECV <<< 3f31080000000000000004eb55f684 (15 bytes)
SEND >>> 313f080000000000000004eb55f684 (15 bytes)
RECV <<< 3f31310c04eb55f6010004eb55f6f5 (15 bytes)
????? received
CLSD
```

As of right now this is the extent to which the server is capable of communicating with the game. The first two messages are essentially just sending back what the client sends with the first two bytes swapped, but this tactic only got me so far.

The third message seems to expect more in return than just a copy of the data it contained, so this is where my investigation ends for the time being.

## TODO

 * Figure out what kind of checksum algorithm is being used
 * Find out what on earth is message `0x31` and what it expects in response
 * Everything else after that

## Thanks

The following resources helped me to get even this far:

 * [Kinnay/NintendoClients wiki (PRUDP Protocol)](https://github.com/Kinnay/NintendoClients/wiki/PRUDP-Protocol)
