# nostr-indexer

An indexer for nostr events that can be installed as an npm package for your backend projects.

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
import { Indexer } from 'nostr-indexer'
const indexer = new Indexer({ dbPath: <FULL_PATH_TO_DB_FILE> })
```

Substitute `<FULL_PATH_TO_DB_FILE>` with the same path used in step 2.

## Development

### Gotchas

src/index.ts needs to export lib file for file changes to be detected. Probably just a ts config issue.
