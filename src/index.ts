import { AccountManager } from './lib/AccountManager';
import { Config } from './lib/Config';
import { Indexer } from './lib/Indexer';
import { RelayManager } from './lib/RelayManager';
import { Logger } from './lib/Logger';
import { DbClient } from './lib/DbClient';
import EventProcessor from './lib/EventProcessor';

// Shim Websocket for NodeJS
Object.assign(global, { WebSocket: require('ws') });

export const createIndexer = (cfg: Config) => {

  const config = new Config(cfg);
  const newLogger = function () {
    return new Logger({ config: cfg });
  }
  const db = new DbClient({ dbPath: cfg.dbPath, logger: newLogger() });
  const eventProcessor = new EventProcessor({ db, logger: newLogger() })
  const relayManager = new RelayManager({ db, eventProcessor, logger: newLogger() })
  const accountManager = new AccountManager({
    db,
    logger: newLogger(),
    relayManager,
    eventProcessor,
  });

  return new Indexer({
    db,
    config,
    relayManager,
    accountManager,
    logger: newLogger(),
  });
};

export * from './lib/Indexer';
export * from './lib/RelayManager';
export * from './lib/Relay';
export * from './lib/AccountManager';
export * from './lib/Account';
export * from './lib/Subscription';
export * from './lib/NostrEvents';
