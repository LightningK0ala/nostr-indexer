import pick from 'just-pick';
import { Event } from '../@types/nostr-tools-shim';
import { DbClient } from './DbClient';
import { Logger } from './Logger';
import { Kind } from './NostrEvents';

type EventJob = {
  from_relay_url: string;
  event: Event
}

export default class EventProcessor {
  private _db: DbClient;
  private _logger: Logger;
  private _eventQueue: EventJob[] = [];

  constructor(opts: { db: DbClient; logger: Logger }) {
    this._db = opts.db;
    this._logger = opts.logger;
  }

  // TODO: Remove this getter
  get db() {
    return this._db;
  }

  get eventQueue() {
    return this._eventQueue;
  }

  addEvent({ event, from_relay_url }: EventJob): Boolean {
    // Skip if event is already in queue
    if (this._eventQueue.filter(ev => ev.event.id === event.id).length > 0) return false;
    this._eventQueue.push({ event, from_relay_url });
    // Trigger processing events loop if this is the first event in queue
    if (this._eventQueue.length == 1) this.processEvents();
    return true;
  }

  async processEvents(): Promise<true> {
    // Skip if event queue is empty
    if (this._eventQueue.length == 0) return true;
    const [eventJob, ...remaining] = this._eventQueue;
    await this.processEvent(eventJob);
    this._eventQueue = remaining;
    return this.processEvents();
  }

  async processEvent(ej: EventJob) {
    if (!ej.event.id || !ej.event.sig) throw new Error("Event doesn't have an id or sig");
    switch (ej.event.kind) {
      case Kind.Metadata:
        return this.processMetadataEvent(ej);
      case Kind.Text:
        return this.processTextEvent(ej);
      case Kind.RecommendRelay:
        return this.processRecommendedRelayEvent(ej);
      case Kind.Contacts:
        return this.processContactsEvent(ej);
      default:
        this._logger.log(
          `EventProcessor: Event kind ${ej.event.kind} processing not implemented`
        );
        return;
    }
  }

  async processTextEvent(_args: EventJob) {
    this._logger.log(`EventProcessor: .processTextEvent not implemented`);
  }

  // TODO: Process tags
  async processContactsEvent(ej: EventJob) {
    return this._db.client.$transaction(async tx => {
      if (!ej.event.id) {
        this._logger.log(`EventProcessor: Event doesn't have an id`)
        return
      }
      await tx.event.upsert({
        where: { event_id: ej.event.id },
        update: {},
        create: {
          event_id: ej.event.id,
          event_created_at: new Date(ej.event.created_at * 1000),
          event_kind: ej.event.kind,
          event_pubkey: ej.event.pubkey,
          event_content: ej.event.content,
          event_signature: ej.event.sig as string,
          from_relay_url: ej.from_relay_url,
          event_tags: JSON.stringify(ej.event.tags),
        }
      })

      // TODO: For each of the contacts, create a user and add it as a follower.

      // Get author
      // const author = await tx.event.findFirst({ where: { event_pubkey: ej.event.pubkey } })



      // await tx.userFollowers.upsert({
      //   where: {
      //     user_id: 1,
      //   }
      //   // update: {},
      //   // create: {
      //   //   user_pubkey: ej.event.pubkey,
      //   //   followers: JSON.stringify(ej.event.followers),
      //   // }
      // })
    })
  }

  async processMetadataEvent(ej: EventJob) {
    const metadata = pick(JSON.parse(ej.event.content), [
      'lud16',
      'website',
      'nip05',
      'picture',
      'banner',
      'display_name',
      'about',
      'name',
    ])
    return this._db.client.$transaction(async tx => {
      const user = await tx.user.findFirst({ where: { pubkey: ej.event.pubkey } })
      if (!user) {
        this._logger.log(`EventProcessor: User not found for pubkey ${ej.event.pubkey}, skipping event creation`)
        return
      }
      if (!ej.event.id) {
        this._logger.log(`EventProcessor: Event doesn't have an id`)
        return
      }
      // TODO: Include tags
      const dbEvent = await tx.event.upsert({
        where: { event_id: ej.event.id },
        update: {},
        create: {
          event_id: ej.event.id,
          event_created_at: new Date(ej.event.created_at * 1000),
          event_kind: ej.event.kind,
          event_pubkey: ej.event.pubkey,
          event_content: ej.event.content,
          event_signature: ej.event.sig as string,
          from_relay_url: ej.from_relay_url,
        }
      })
      await tx.metadata.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          event_id: dbEvent.id,
          ...metadata
        }
      });
      this._logger.log(`Created metadata and event`);
    })
  }

  async processRecommendedRelayEvent(ej: EventJob) {
    if (!ej.event.id) this._logger.log(`EventProcessor: Event doesn't have an id`);
    if (!ej.event.sig) this._logger.log(`EventProcessor: Event doesn't have a sig`);
    return this._db.client.event.create({
      data: {
        event_id: ej.event.id as string,
        event_created_at: new Date(ej.event.created_at * 1000),
        event_kind: ej.event.kind,
        event_pubkey: ej.event.pubkey,
        event_content: ej.event.content,
        event_signature: ej.event.sig as string,
        from_relay_url: ej.from_relay_url
        // TODO Add relay reference
        // event_tags: {
        //   create: e.tags.map(tag => ({ tag_name: tag })),
        // },
      },
    });
  }
}
