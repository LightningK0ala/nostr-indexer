> WARNING: This project is still under heavy development. There are many features still missing and no security audits have been made. Use at your own risk.

# 🔍 nostr-indexer

An indexer for nostr events that can be installed as an npm package for your backend projects. It can be used as a backbone to build:

- Lightweight node for your personal nostr data and social graph.
- REST / GraphQL / tRPC backend to power a lightweight client application.
- Event notification system.
- AI powered content filter (block dic pics)
- ...?

nostr-indexer abstracts the connections and subscriptions made to relays and provides a simple interface to configure + retrieve data from the indexer. Data is stored in an sqlite database and available to be queried using SQL or built-in functions.

## 🤷‍♂️ Why?

Almost all nostr clients currently are communicating with relays directly. This can be problematic:

- Data you care about is not immediately available, when you open most of the existing apps, data trickles in.
- Background syncing is hard to implement in some cases (eg. web / PWAs) and will put a strain on mobile device's battery life, bandwidth and storage.
- There is no single source of truth for your data and social graph so your experience on different devices can be inconsistent.
- Notifications are harder to implement without relying on third parties.
- Developer experience can be simplified if we can fetch data using common patterns like REST, GraphQL, tRPC...

nostr-indexer will be useful for those who want to build something that can take the computational load of sorting their nostr data, is always on and available on a server (locally or remotely).

## 🚀 Getting Started

### 1. Installation

```
yarn add nostr-indexer
```

### 2. Setup Database

```
DATABASE_URL=file:<FULL_PATH_TO_DB_FILE> npx prisma migrate reset --schema ./node_modules/nostr-indexer/prisma/schema.prisma
```

Substitute `<FULL_PATH_TO_DB_FILE>` with the full absolute path to your db file, eg. `/my-project/nostr.db`

### 3. Usage

Some vanilla javascript code that you can try putting into a `index.js` and running with `DB_PATH=<FULL_PATH_TO_DB_FILE> node index.js`

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

## Projects
Example projects using nostr-indexer:
- [nostr-indexer-graphql](https://github.com/LightningK0ala/nostr-indexer-graphql): A GraphQL server exposing an API for nostr-indexer data.
- [nostr-indexer-cli](https://github.com/LightningK0ala/nostr-indexer-cli): An interactive cli for nostr-indexer.

## Contributions
Contributions are welcome! If you build anything with this library please make a pull request to include a link to it.

## Roadmap
- [x] Add relay.
- [x] Add account.
- [x] Index metadata.
- [ ] Emit event when new data is indexed.
- [ ] Allow event to be consumed with a listener or callback.
- [ ] Index followers + n.
- [ ] Index DMs.
- [ ] Index notes.
- [ ] Index channels.
