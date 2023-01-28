import { NostrRelay } from '../@types/nostr-tools-shim';
import { Logger } from './Logger';
import { Subscription } from './Subscription';

export class Relay {
  private _id: number;
  private _url: string;
  private _connected: boolean = false;
  private _relay: NostrRelay;
  private _logger: Logger;
  private _subscriptions = new Map<string, Subscription>();

  constructor({
    id,
    url,
    logger,
    relayInit,
  }: {
    id: number;
    url: string;
    logger: Logger;
    relayInit: (url: string) => NostrRelay;
  }) {
    this._id = id;
    this._url = url;
    this._logger = logger;
    this._relay = relayInit(url) as any;
    this._relay.on('connect', () => {
      this._logger.log(`Connected to relay ${this._url}`);
      this._connected = true;
    });

    this._relay.on('error', (e: any) => {
      this._logger.log(`Failed to connect to relay ${this._url}`, e);
      this._connected = false;
    });

    this._relay.on('disconnect', () => {
      // TODO
      // - Implement a smarter reconnect strategy, eg. with throttle / exponential backoff
      this._logger.log(`Disconnected from relay ${this._url}`);
      this._connected = false;
    });
  }

  // Getters
  get id() {
    return this._id;
  }
  get url() {
    return this._url;
  }
  get connected() {
    return this._connected;
  }

  // Methods
  async connect() {
    return this._relay
      .connect()
      .then(() => {
        this._connected = true;
      })
      .catch(() => {});
  }

  async disconnect() {
    await this._relay.close();
  }

  subscribe(subscription: Subscription) {
    const { onEvent, onEose } = subscription;
    const sub = this._relay.sub(subscription.filters);
    // keep a reference to the sub so we can close it later if necessary
    subscription.sub = sub;
    this._subscriptions.set(subscription.id, subscription);
    onEvent && sub.on('event', onEvent);
    onEose && sub.on('eose', () => onEose(sub));
    return sub;
  }

  // TODO
  // - Function argument to specify the filters
  // - Function argument to specify whether to close on eose or keep open
  // subscribe({ filters, closeOnEose }: { filters: any; closeOnEose: boolean }) {
  //   if (!this._connected) return this._logger.log('Not connected to relay');
  //   const filtersStr = JSON.stringify(filters);
  //   const filtersHash = sha1Hash(filtersStr);
  //   if (this._subscriptions.has(filtersHash))
  //     return this._logger.log('Subscription already exist');
  //   const sub = this._relay.sub(filters);
  //   this._subscriptions.set(filtersHash, {
  //     sub,
  //     filtersStr,
  //     createdAt: new Date(),
  //   });
  //   this._logger.log('New subscription added');

  //   sub.on('event', async (event: NostrEvent) => {
  //     this._logger.log(`Received event ${event.id}`);
  //     if (!event.id) return;
  //     this._logger.log(`Creating event ${event.id}`);
  //     if (!event.sig)
  //       return this._logger.log(`Event ${event.id} has no signature`);
  //     this._db.event
  //       .create({
  //         data: {
  //           event_id: event.id,
  //           event_tags: JSON.stringify(event.tags),
  //           event_signature: event.sig,
  //           event_kind: event.kind,
  //           event_content: event.content,
  //           event_pubkey: event.pubkey,
  //           event_createdAt: new Date(event.created_at),
  //         },
  //       })
  //       .then((e: Event) => this._logger.log(`Created event ${e.event_id}`))
  //       .catch((e: PrismaClientKnownRequestError) => {
  //         if (e.code == 'P2002') {
  //           return this._logger.log(
  //             `Cannot create event ${event.id} already exists`
  //           );
  //         }
  //         this._logger.log(`Failed to create event ${event.id}`, e.message);
  //       });
  //   });

  //   sub.on('eose', () => {
  //     this._logger.log('eose');
  //     if (closeOnEose) {
  //       sub.unsub();
  //       this._subscriptions.delete(filtersHash);
  //     }
  //   });
  // }

  unsubscribe() {}
}

// run({
//   // relay,
//   onEvent,
//   onEose,
// }: {
//   relay: Relay;
//   onEvent: (event: Event) => void;
//   onEose: () => void;
// }) {
//   // if (!this._relay.connected)
//   return this._logger.log('Relay is not connected');
//   // this._logger.log(this._filters);
//   // this._sub = this._relay.subscribe(this._filters);
//   this._sub?.on('event', onEvent);
//   this._sub?.on('eose', onEose);
// }

// private handleEvent = (_event: NostrEve) => {
// if (!event.id) return;
// this._logger.log(`Event received on subscription id ${this._id}`);
// if (!event.sig)
//   return this._logger.log(`Event ${event.id} has no signature`);
// this._db.event
//   .create({
//     data: {
//       event_id: event.id,
//       event_tags: JSON.stringify(event.tags),
//       event_signature: event.sig,
//       event_kind: event.kind,
//       event_content: event.content,
//       event_pubkey: event.pubkey,
//       event_createdAt: new Date(event.created_at),
//     },
//   })
//   .then((e: Event) => this._logger.log(`Created event ${e.event_id}`))
//   .catch((e: PrismaClientKnownRequestError) => {
//     if (e.code == 'P2002') {
//       return this._logger.log(
//         `Cannot create event ${event.id} already exists`
//       );
//     }
//     this._logger.log(`Failed to create event ${event.id}`, e.message);
//   });
// };

// private handleEose = () => {
//   this._logger.log('eose');
//   if (this._closeOnEose) {
//     this._sub?.unsub();
//   }
// };

//   if (!event.id) return;
//   this._logger.log(`Creating event ${event.id}`);
//   if (!event.sig)
//     return this._logger.log(`Event ${event.id} has no signature`);
//   this._db.event
//     .create({
//       data: {
//         event_id: event.id,
//         event_tags: JSON.stringify(event.tags),
//         event_signature: event.sig,
//         event_kind: event.kind,
//         event_content: event.content,
//         event_pubkey: event.pubkey,
//         event_createdAt: new Date(event.created_at),
//       },
//     })
//     .then((e: Event) => this._logger.log(`Created event ${e.event_id}`))
//     .catch((e: PrismaClientKnownRequestError) => {
//       if (e.code == 'P2002') {
//         return this._logger.log(
//           `Cannot create event ${event.id} already exists`
//         );
//       }
//       this._logger.log(`Failed to create event ${event.id}`, e.message);
//     });
