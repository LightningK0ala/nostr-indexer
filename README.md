> WARNING: This project is still under heavy development. There are many features still missing and no security audits have been made. Use at your own risk.

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
- There is no single source of truth for your data and social graph so your experience on different devices can be inconsistent.
- Notifications are harder to implement without relying on third parties.
- Developer experience can be simplified if we can fetch data using common patterns like REST, GraphQL, tRPC...

## 🔌 How?

`nostr-indexer` lets you add accounts (your pubkeys) to the indexer and configure the relays you want to use. The indexer will automatically subscribe to relays for nostr events about relevant to your account and social graph and insert it into an sqlite relational database. Data is indexed into multiple tables to enable a structured and efficient querying using SQL:

- `Account`: Represents an account to be indexed, these can be added using the indexer `.addAccount(pubkey)` function.
- `User`: Represents a user in nostr.
- `Metadata`: Holds metadata information for users (NIP-01 Kind 0).
- `Relay`: Relays that have been configured for the indexer to use. At the moment use `.addRelay(url)` provided in the indexer.
- `Event`: Stores all raw events that were indexed. Useful to keep as a reference or backup. Can eventually be used to sync events to a new relay or for reindexing from scratch.

See the [database schema](prisma/schema.prisma) for more information about what columns each table has.

A Prisma ORM client is exposed by the indexer for database queries (see code example).
There are also some functions provided by the indexer to give you information about the status of the indexer.

# 🚀 Getting Started

### 1. Installation

```
yarn add nostr-indexer
```

### 2. Setup Database

```
DATABASE_URL=file:<FULL_PATH_TO_DB_FILE> npx prisma migrate reset --schema ./node_modules/nostr-indexer/dist/prisma/schema.prisma
```

Substitute `<FULL_PATH_TO_DB_FILE>` with the full absolute path to your db file, eg. `/my-project/nostr.db`

### 3. Usage

Some vanilla javascript code that you can try putting into a `index.js` and running with `DB_PATH=<FULL_PATH_TO_DB_FILE> node index.js`

```
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

## Roadmap

- [x] Add relay.
- [x] Add account.
- [x] Index metadata.
- [ ] Index followers + n.
- [ ] Index DMs.
- [ ] Index notes.
- [ ] Index channels.
- [ ] Prepare unsigned events to publish.
- [ ] Publish events.
- [ ] Emit event when new data is indexed.
- [ ] Allow new events to be consumed via listener or callback.
- [ ] Allow accounts with private keys (for searchable encrypted DMs? ...?)
