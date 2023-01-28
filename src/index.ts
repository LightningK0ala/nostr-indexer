import { AccountManager } from './lib/AccountManager';
import { Config } from './lib/Config';
import { Indexer } from './lib/Indexer';
import { RelayManager } from './lib/RelayManager';
import { Logger } from './lib/Logger';
import { relayInit } from 'nostr-tools';
import { DbClient } from './lib/DbClient';

// Shim Websocket for NodeJS
Object.assign(global, { WebSocket: require('ws') });

export const createIndexer = (cfg: Config) => {
  const config = new Config(cfg);
  const logger = new Logger({ config });
  const db = new DbClient({ dbPath: cfg.dbPath, logger });
  const relayManager = new RelayManager({ db, logger, relayInit });
  const accountManager = new AccountManager({
    db,
    logger,
    relayManager,
  });

  return new Indexer({
    db,
    config,
    relayManager,
    accountManager,
    logger,
  });
};

export * from './lib/Indexer';
export * from './lib/RelayManager';
export * from './lib/Relay';
export * from './lib/AccountManager';
export * from './lib/Account';
export * from './lib/Subscription';
export * from './lib/NostrEvents';
