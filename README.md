> WARNING: This project is still under heavy development. Currently undergoing rearchitecting. There are many features still missing and no security audits have been made. Use at your own risk.

# 🔍 nostr-indexer

An indexer for nostr events that can be installed as an npm package for your backend projects. It can be used as a backbone to build:

- Remote backend (in REST, GraphQL, tRPC, ...) for a lightweight mobile / web client.
- Local backend for a desktop client.
- Personal nostr data and social graph vault.
- Event notification system.
- Bots.

## 🤷‍♂️ Why?

Almost all nostr clients currently are communicating with relays directly. This can be problematic:

- Data you care about is not immediately available, when you open most of the existing apps, you have to wait for data to trickle in.
- Background syncing is not trivial, specially for web / PWAs. Battery life, storage and bandwidth are things to consider on mobile devices.
- There is no single source of truth for your data and social graph so your experience on different devices / clients can be inconsistent.
- Notifications are harder to implement without relying on third parties.
- Developer experience can be simplified if we can fetch data using common patterns like REST, GraphQL, tRPC...
- Replicating your posted data to a new relay might be an issue if your client doesn't hold a full cache / provide that feature.
- Without a full client cache, your data can be permanently lost as there is no guarantee that relays will hold it / remain online.

## 🔌 How?
`nostr-indexer` is like your own personal mini-relay.
You start by telling it your account public key and the relays you post to. The indexer then fetches all your personal data and your social graph, making decisions about which relays to fetch from and which data is relevant to you. It indexes this data and provides a convenient set of functions to interact with it.

Additionally, the database can be queried directly by using the exposed prisma db client.

See the [database schema](prisma/schema.prisma) for more information about what columns each table has.

# 🚀 Getting Started

### 1. Installation

```console
yarn add nostr-indexer
```

### 2. Setup Database

```console
DATABASE_URL=file:<FULL_PATH_TO_DB_FILE> npx prisma migrate reset --schema ./node_modules/nostr-indexer/dist/prisma/schema.prisma
```

Substitute `<FULL_PATH_TO_DB_FILE>` with the full absolute path to your db file, eg. `/my-project/nostr.db`

### 3. Usage

Some vanilla javascript code that you can try putting into a `index.js` and running with `DB_PATH=<FULL_PATH_TO_DB_FILE> node index.js`

```js
(async () => {
  const nostr = require('nostr-indexer')

  /** @type {import('nostr-indexer').Indexer} */
  // Create the indexer, passing in the path to the database
  const indexer = nostr.createIndexer({
    dbPath: process.env.DB_PATH,
    // debug: true
  })

  // Add relays
  indexer.addRelay("wss://nostr.fmt.wiz.biz")
  indexer.addRelay("wss://jiggytom.ddns.net")

  // Start
  indexer.start()

  /** @type {import('nostr-indexer').Account} */
  // Add an account to index
  const account = await indexer.addAccount("63c3f814e38f0b5bd64515a063791a0fdfd5b276a31bae4856a16219d8aa0d1f")

  setInterval(async () => {
    // Indexer database can be queried directly from the database using an internal prisma orm client
    // If any metadata changes get published to one of the relays, they will be reflected in our database.
    console.log("Metadata:", await indexer.db.client.metadata.findUnique({ where: { user_id: account.user_id } }))
  }, 1000)
})();
```

## Projects

Example projects using nostr-indexer:

- [nostr-indexer-graphql](https://github.com/LightningK0ala/nostr-indexer-graphql): A GraphQL server exposing an API for nostr-indexer data.
- [nostr-indexer-cli](https://github.com/LightningK0ala/nostr-indexer-cli): An interactive cli for nostr-indexer.

## Contributions

Contributions are welcome! If you build anything with this library please make a pull request to include a link to it.
