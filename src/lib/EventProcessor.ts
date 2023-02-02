import { Event } from '../@types/nostr-tools-shim';
import { DbClient } from './DbClient';
import { Logger } from './Logger';

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
      case 0:
        return this.processKind0Event(e);
      case 1:
        return this.processKind1Event(e);
      case 2:
        return this.processKind2Event(e);
      default:
        this._logger.log(
          `EventProcessor: Event kind ${e.kind} processing not implemented`
        );
        return;
    }
  }

  async processKind0Event(_e: Event) {
    this._logger.log(`EventProcessor: .processKind0Event not implemented`);
    // TODO
  }

  async processKind1Event(_e: Event) {
    this._logger.log(`EventProcessor: .processKind1Event not implemented`);
    // TODO
  }

  async processKind2Event(e: Event) {
    try {
      this._db.client.event.create({
        data: {
          event_id: e.id as string,
          event_created_at: new Date(e.created_at * 1000),
          event_kind: e.kind,
          event_pubkey: e.pubkey,
          event_content: e.content,
          event_signature: e.sig,
          event_tags: {
            create: e.tags.map(tag => ({ tag_name: tag })),
          },
        },
      });
    } catch (e) {
      return;
    }
    this._logger.log(`EventProcessor: .processKind2Event not implemented`);
    // TODO
  }
}
