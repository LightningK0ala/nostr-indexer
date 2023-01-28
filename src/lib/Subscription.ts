import { Event, Filter, Sub } from '../@types/nostr-tools-shim';
import { sha1Hash } from '../utils/crypto';

export class Subscription {
  private _id: string;
  private _filters: Filter[];
  private _sub?: Sub;
  private _onEvent?: (event: Event) => void;
  private _onEose?: (sub: Sub) => void;
  private _closeOnEose: boolean;
  private _createdAt: Date;

  constructor({
    filters,
    closeOnEose,
    onEvent,
    onEose,
  }: {
    filters: Filter[];
    closeOnEose: boolean;
    onEvent: (event: Event) => void;
    onEose: (sub: Sub) => void;
  }) {
    this._closeOnEose = closeOnEose;
    this._id = sha1Hash(JSON.stringify(filters));
    this._filters = filters;
    this._onEvent = onEvent;
    this._onEose = onEose;
    this._createdAt = new Date();
  }

  get id() {
    return this._id;
  }
  get filters() {
    return this._filters;
  }
  get closeOnEose() {
    return this._closeOnEose;
  }
  get createdAt() {
    return this._createdAt;
  }
  get onEose() {
    return this._onEose;
  }
  get onEvent() {
    return this._onEvent;
  }

  getSub() {
    return this._sub;
  }

  set sub(sub: Sub) {
    this._sub = sub;
  }
}
