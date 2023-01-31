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
  get db {
    return this._db
  }

  addEvent(e: Event): Boolean {
    // Skip if event is already in queue
    if (this._eventQueue.filter(ev => ev.id === e.id).length > 0) return false;
    this._eventQueue.push(e);
    // Trigger processing events loop if this is the first event in queue
    if (this._eventQueue.length == 1) this.processEvents();
    return true;
  }

  processEvents(): Boolean {
    // Skip if event queue is empty
    if (this._eventQueue.length == 0) return false;
    const [event, ...rest] = this._eventQueue;
    this._eventQueue = rest;
    this.processEvent(event);
    return true;
  }

  processEvent(e: Event) {
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

  processKind0Event(_e: Event) {
    this._logger.log(
      `EventProcessor: .processKind0Event not implemented`
    );
    // TODO
  }

  processKind1Event(_e: Event) {
    this._logger.log(
      `EventProcessor: .processKind1Event not implemented`
    );
    // TODO
  }

  processKind2Event(_e: Event) {
    this._logger.log(
      `EventProcessor: .processKind2Event not implemented`
    );
    // TODO
  }
}
