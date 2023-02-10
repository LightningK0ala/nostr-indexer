import { Event, Filter, Kind, Sub } from '../@types/nostr-tools-shim';
import { Logger, LogType } from './Logger';
import { Relay } from './Relay';
import { sha1Hash } from '../utils/crypto';
import { DbClient, DbRelay } from './DbClient';
import EventProcessor from './EventProcessor';

/**
 * The SubscriptionManager ensures that subscriptions to relays are
 * 
 * 
 */

interface SubscriptionOpts {
  relayUrl: string,
  userId: number,
  kinds: Kind,
  since?: Date,
}

// filters: [{...}]

interface Subscription {
  sub: Sub,
  filters: string,
  kind: Kind,
  relayUrl: string,
  userId: string,
}

export class SubscriptionManager {
  _logger: Logger;
  _subscriptions: Subscription[] = []

  constructor(opts: {
    logger: Logger;
  }) {
    opts.logger.type = LogType.RELAY_MANAGER;
    this._logger = opts.logger;
  }

  // addSubscription(opts: SubscriptionOpts) {
  //   switch (opts.kinds) {
  //     case Kind.Metadata:
  //       return this.processMetadataEvent(ej);
  //     case Kind.Text:
  //       return this.processTextEvent(ej);
  //     case Kind.RecommendRelay:
  //       return this.processRecommendedRelayEvent(ej);
  //     case Kind.Contacts:
  //       return this.processContactsEvent(ej);
  //     default:
  //       this._logger.log(
  //         `Event kind ${ej.event.kind} processing not implemented`
  //       );
  //       return;
  //   }
  // }
}
