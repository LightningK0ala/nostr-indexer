import { nip19 } from 'nostr-tools';
import { Event } from '../@types/nostr-tools-shim';
import { DbClient } from './DbClient';
import { Logger } from './Logger';
import { Kind0Event } from './NostrEvents';
import { RelayManager } from './RelayManager';

export class Account {
  private _id: number;
  private _userId: number;
  private _logger: Logger;
  private _db: DbClient;
  private _relayManager: RelayManager;
  // TODO: remove undescore for public properties
  _pubkey: string;
  _privateKey?: string;

  constructor({
    id,
    userId,
    logger,
    db,
    relayManager,
    pubkey,
    privateKey,
  }: {
    id: number;
    userId: number;
    logger: Logger;
    db: DbClient;
    relayManager: RelayManager;
    pubkey: string;
    privateKey?: string;
  }) {
    this._id = id;
    this._userId = userId;
    this._logger = logger;
    this._db = db;
    this._relayManager = relayManager;
    this._pubkey = pubkey;
    if (privateKey) {
      this._privateKey = privateKey;
    }
  }

  get id() {
    return this._id;
  }

  get pubkey() {
    return this._pubkey;
  }

  get privateKey() {
    return this._privateKey;
  }

  static validatePubkey(_pubkey: string) {
    // TODO
    return true;
  }

  static convertPubkeyToHex(pubkey: string) {
    let hexPubkey = pubkey;
    if (pubkey.startsWith('npub')) {
      const { data } = nip19.decode(pubkey);
      hexPubkey = data as string;
    }
    return hexPubkey;
  }

  async getMetadata() {
    return this._db.getMetadata({ user_id: this._userId });
  }

  // NIP-01
  // https://github.com/nostr-protocol/nips/blob/master/01.md
  // Kinds: 0 = metadata, 1 = text note, 2 = recommend_server
  indexMetadata() {
    this._logger.log('Indexing metadata for account', 'pubkey:', this._pubkey);
    // Latest one is the only one that matters
    const filters = [
      {
        kinds: [0],
        authors: [this._pubkey],
        limit: 1,
      },
    ];
    this._relayManager.addSubscription({
      filters,
      closeOnEose: false, // Keep subscription open
      onEvent: async (event: Event) => {
        // If event id or content not set skip processing it
        if (!event.id || !event.content) {
          this._logger.log(
            'Huh... event has no id or content, skipping',
            'filters:',
            JSON.stringify(filters),
            'event.id:',
            event.id,
            'event.content:',
            event.content
          );
          return;
        }

        const nostrEvent = new Kind0Event(event);
        this._logger.log('Processing event', 'event_id:', `${event?.id}`);
        try {
          await this._db.createMetadata({
            userId: this._userId,
            event: nostrEvent.parsedNostrEvent,
            metadata: nostrEvent.parsedContent,
          });
          // TODO: Emit event that metadata was indexed?
        } catch (e) {
          return;
        }
      },
    });
  }

  indexAccount() {
    this._logger.log('Indexing account: ' + this._pubkey);
    this.indexMetadata();
  }
}
