import { Event, Filter, Sub } from '../@types/nostr-tools-shim';
import { Logger, LogType } from './Logger';
import { Relay } from './Relay';
import { Subscription } from './Subscription';
import { sha1Hash } from '../utils/crypto';
import { DbClient, DbRelay } from './DbClient';
import EventProcessor from './EventProcessor';

type RelayManagerOpts = {
  db: DbClient;
  logger: Logger;
  eventProcessor: EventProcessor;
}

export class RelayManager {
  private _db: DbClient;
  private _relays = new Map<string, Relay>();
  private _logger: Logger;
  // Key is the hash for the stringified subscription filters
  private _subscriptions = new Map<string, Subscription>();
  private _eventProcessor: EventProcessor;

  constructor(opts: RelayManagerOpts) {
    this._db = opts.db;
    opts.logger.type = LogType.RELAY_MANAGER;
    this._logger = opts.logger;
    this._eventProcessor = opts.eventProcessor;
  }

  /**
   * Creates a new relay manager and loads relays from db
   */
  static async create(opts: RelayManagerOpts) {
    const rm = new RelayManager(opts);
    await rm.loadRelaysFromDb()
    return rm
  }

  get subscriptions() {
    return this._subscriptions;
  }

  get relays() {
    return this._relays;
  }

  get connectedRelays() {
    return Array.from(this._relays.values()).filter(
      (relay: Relay) => relay.connected
    );
  }

  /**
   * Load relays from db and add them to the relay manager
   */
  async loadRelaysFromDb() {
    this._logger.log('Loading relays from db');
    const relays = await this._db.client.relay.findMany();
    relays.forEach(async ({ id, url }: DbRelay) => {
      if (this._relays.has(url)) return
      const relay = new Relay({
        id,
        url,
        db: this._db,
        logger: this._logger,
        eventProcessor: this._eventProcessor
      });
      this._relays.set(url, relay);
    });
  }

  async connectRelays() {
    return this._relays.forEach(async (relay) => {
      try {
        await relay.connect().catch();
      } catch (e) { }
    })
  }

  async disconnectRelays() {
    try {
      for (const relay of this._relays.values()) {
        await relay.disconnect();
      }
      return true
    } catch (e) {
      this._logger.log('Error disconnecting relays', e);
      return false
    }
  }

  /**
   * Add a relay to the relay manager if it doesn't exist
   * and db if it doesn't exist.
   * 
   * @param url 
   * @returns 
   */
  async addRelay(url: string) {
    if (this._relays.has(url)) return true
    try {
      const dbRelay = await this._db.client.relay.upsert(
        {
          where: { url },
          update: {},
          create: { url },
        }
      );
      const relay = new Relay({
        id: dbRelay.id,
        url,
        db: this._db,
        logger: this._logger,
        eventProcessor: this._eventProcessor
      })
      this._relays.set(url, relay)
      this._logger.log(`Relay added ${url}`);
      return true
    } catch (e) {
      this._logger.log('Unexpected error adding relay', e);
      return false
    }
  }

  /**
   * Disconnects, removes relay from relay manager and db
   * 
   * @param url 
   */
  async removeRelay(url: string) {
    const relay = this._relays.get(url)
    if (!relay) return false
    await relay.disconnect()
    await this._db.client.relay.delete({ where: { id: relay.id } })
    this._relays.delete(url)
    return true
  }

  addSubscription({
    filters,
    closeOnEose,
    onEvent = () => { },
    onEose = () => { },
  }: {
    filters: Filter[];
    closeOnEose: boolean;
    onEvent?: (event: Event) => void;
    onEose?: (sub: Sub) => void;
  }) {
    this._logger.log('Adding subscription to relay manager');
    const subscription = new Subscription({
      filters,
      closeOnEose,
      onEvent,
      onEose,
    });
    this._subscriptions.set(subscription.id, subscription);
    // Register the subscription in every relay
    this._relays.forEach(relay => relay.subscribe(subscription));
    return subscription.id;
  }

  removeSubscription(id: string) {
    this._subscriptions.delete(id);
  }

  hasSubscription(filters: Filter[]) {
    const id = sha1Hash(JSON.stringify(filters));
    return this._subscriptions.has(id);
  }
}
