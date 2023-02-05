import pick from 'just-pick';
import { Event } from '../@types/nostr-tools-shim';
import { DbClient } from './DbClient';
import { Logger } from './Logger';
import { Kind } from './NostrEvents';

export default class EventProcessor {
  private _db: DbClient;
  private _logger: Logger;
  private _eventQueue: Event[] = [];

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

  addEvent(e: Event): Boolean {
    // Skip if event is already in queue
    if (this._eventQueue.filter(ev => ev.id === e.id).length > 0) return false;
    this._eventQueue.push(e);
    this._logger.log(`EventProcessor: Added event ${e.id} to queue`);
    // Trigger processing events loop if this is the first event in queue
    if (this._eventQueue.length == 1) this.processEvents();
    return true;
  }

  async processEvents(): Promise<boolean> {
    // Skip if event queue is empty
    if (this._eventQueue.length == 0) return false;
    const [event, ...remaining] = this._eventQueue;
    // TODO: Move this until after we've processed the event
    await this.processEvent(event);
    this._eventQueue = remaining;
    return true;
  }

  async processEvent(e: Event) {
    if (!e.id || !e.sig) throw new Error("Event doesn't have an id or sig");
    switch (e.kind) {
      case Kind.Metadata:
        return this.processKind0Event(e);
      case Kind.Text:
        return this.processKind1Event(e);
      case Kind.RecommendRelay:
        return this.processKind2Event(e);
      default:
        this._logger.log(
          `EventProcessor: Event kind ${e.kind} processing not implemented`
        );
        return;
    }
  }

  async processKind0Event(e: Event) {
    const metadata = pick(JSON.parse(e.content), [
      'lud16',
      'website',
      'nip05',
      'picture',
      'banner',
      'display_name',
      'about',
      'name',
    ])
    await this._db.client.$transaction(async tx => {
      const user = await tx.user.findFirst({ where: { pubkey: e.pubkey } })
      if (!user) {
        this._logger.log(`EventProcessor: User not found for pubkey ${e.pubkey}, skipping event creation`)
        return
      }
      if (!e.id) {
        this._logger.log(`EventProcessor: Event doesn't have an id`)
        return
      }
      const dbEvent = await tx.event.upsert({
        where: { event_id: e.id },
        update: {},
        create: {
          event_id: e.id,
          event_created_at: new Date(e.created_at * 1000),
          event_kind: e.kind,
          event_pubkey: e.pubkey,
          event_content: e.content,
          event_signature: e.sig as string,
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


  async processKind1Event(_e: Event) {
    this._logger.log(`EventProcessor: .processKind1Event not implemented`);
    // TODO
  }

  async processKind2Event(e: Event) {
    if (!e.id) this._logger.log(`EventProcessor: Event doesn't have an id`);
    if (!e.sig) this._logger.log(`EventProcessor: Event doesn't have a sig`);
    try {
      this._db.client.event.create({
        data: {
          event_id: e.id as string,
          event_created_at: new Date(e.created_at * 1000),
          event_kind: e.kind,
          event_pubkey: e.pubkey,
          event_content: e.content,
          event_signature: e.sig as string,
          // TODO Add relay reference
          // event_tags: {
          //   create: e.tags.map(tag => ({ tag_name: tag })),
          // },
        },
      });
    } catch (e) {
      return;
    }
    this._logger.log(`EventProcessor: .processKind2Event not implemented`);
    // TODO
  }
}
