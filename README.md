> WARNING: This project is still under heavy development. Use at your own risk.

# nostr-indexer

An indexer for nostr events that can be installed as an npm package for your backend projects. It can be used to build:

- Lightweight data bank / node for your nostr data along with the people you follow / interact with (eg. through DMs). This can easily run on a device like a raspberry pi or be integrated into an umbrel node.
- REST / GraphQL / tRPC backend to power a lightweight client application.
- Event notification system.
- etc...

## Why?

Almost all nostr clients currently are communicating with relays directly. This can pose several problems like:

- The data you care about is not immediately available when you open your client, this isn't great UX for what users expect from modern social media applications.
- Even if clients can sync in the background, issues like battery consumption, network bandwidth, storage crop up.
- Without background syncing, notifications can't be easily implemented without relying on third parties.
- Relay query language is very limited for things like figuring out your DM contact list.
- The experience across multiple devices will vary because there isn't a single source of truth for your data.
- DX can be greatly simplified if we can rely on common data fetching patterns other than just websockets.
- etc...

## Getting Started

### 1. Installation

```
yarn add nostr-indexer
```

### 2. Setup Database

```
DATABASE_URL=file:<FULL_PATH_TO_DB_FILE> npx prisma migrate reset --schema ./node_modules/nostr-indexer/prisma/schema.prisma
```

Substitute `<FULL_PATH_TO_DB_FILE>` with the full absolute path to your db file, eg. `~/my-project/nostr.db`

### 3. Usage

TODO: Add usage example

```
(async () => {
  const nostr = require('nostr-indexer')

  /** @type {import('nostr-indexer').Indexer} */
  // Create the indexer, passing in the path to the database
  const nostrIndexer = nostr.createIndexer({
    dbPath: process.env.DB_PATH,
    // debug: true
  })

  // Add relays
  nostrIndexer.relayManager.addRelay("wss://nostr.fmt.wiz.biz")
  nostrIndexer.relayManager.addRelay("wss://jiggytom.ddns.net")

  // Start
  nostrIndexer.start()

  /** @type {import('nostr-indexer').Account} */
  // Add an account to index
  const account = await nostrIndexer.accountManager.addAccount({
    pubkey: "63c3f814e38f0b5bd64515a063791a0fdfd5b276a31bae4856a16219d8aa0d1f"
  })

  setInterval(async () => {
    // Metadata is logged every second. If any changes get published to one of the relays,
    // the indexer will pick them up and they will be reflected here.
    console.log("Metadata:", await account.getMetadata())
  }, 1000)
})();
```

Substitute `<FULL_PATH_TO_DB_FILE>` with the same path used in step 2.

## Development

### Gotchas

src/index.ts needs to export lib file for file changes to be detected. Probably just a ts config issue.
