import { Event, Filter, Sub } from '../@types/nostr-tools-shim';
import { Logger } from './Logger';
import { Relay } from './Relay';
import { Subscription } from './Subscription';
import { sha1Hash } from '../utils/crypto';
import { DbClient, DbRelay } from './DbClient';
import EventProcessor from './EventProcessor';

export class RelayManager {
  private _db: DbClient;
  private _relays = new Map<number, Relay>();
  private _logger: Logger;
  // Key is the hash for the stringified subscription filters
  private _subscriptions = new Map<string, Subscription>();
  private _eventProcessor: EventProcessor;

  constructor(opts: {
    db: DbClient;
    logger: Logger;
    eventProcessor: EventProcessor;
  }) {
    this._db = opts.db;
    this._logger = opts.logger;
    this._eventProcessor = opts.eventProcessor;
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

  async setup() {
    this._logger.log('Loading relays from db');
    const relays = await this._db.client.relay.findMany();
    relays.forEach(({ id, url }: DbRelay) => {
      this.setupNewRelay({ id, url });
    });
  }

  private setupNewRelay({ id, url }: { id: number; url: string }) {
    if (this._relays.has(id)) return;
    const relay = new Relay({
      id,
      url,
      logger: this._logger,
      eventProcessor: this._eventProcessor
    });
    relay.connect();
    this._relays.set(id, relay);
    // Add all existing subscriptions to the relay
    this._subscriptions.forEach(subscription => relay.subscribe(subscription));
  }

  async teardown() {
    // log('Disconnecting relays');
    // TODO
    // disconnect each relay and clear the array
    this._relays.forEach(async relay => {
      await relay.disconnect();
    });
    this._relays.clear();
  }

  async addRelay(url: string) {
    let dbRelay: DbRelay | null;
    dbRelay = await this._db.client.relay.findUnique({ where: { url } });
    if (!dbRelay) {
      dbRelay = await this._db.createRelay({ url });
    }
    if (!dbRelay) throw new Error('Failed to create relay');
    this.setupNewRelay({ id: dbRelay.id, url: dbRelay.url });
    return dbRelay;
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
