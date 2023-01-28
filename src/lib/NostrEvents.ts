import pick from 'just-pick';
import { Event } from '../@types/nostr-tools-shim';

export enum Kind {
  Metadata = 0,
  Text = 1,
  RecommendRelay = 2,
  Contacts = 3,
  EncryptedDirectMessage = 4,
  EventDeletion = 5,
  Reaction = 7,
  ChannelCreation = 40,
  ChannelMetadata = 41,
  ChannelMessage = 42,
  ChannelHideMessage = 43,
  ChannelMuteUser = 44,
}

export class NostrEvent {
  id?: string;
  signature?: string;
  kind: Kind;
  tags: string[][];
  pubkey: string;
  content: string;
  created_at: Date;

  constructor(e: Event) {
    this.id = e.id;
    this.signature = e.sig;
    this.kind = e.kind;
    this.tags = e.tags;
    this.pubkey = e.pubkey;
    this.content = e.content;
    this.created_at = new Date(e.created_at);
  }

  get parsedNostrEvent() {
    if (!this.id || !this.signature) {
      throw new Error('Event is missing id or sig');
    }
    return {
      event_id: this.id,
      event_createdAt: new Date(this.created_at),
      event_kind: this.kind,
      event_signature: this.signature,
      event_content: this.content,
      event_pubkey: this.pubkey,
      // event_tags: JSON.stringify(event.tags),
    };
  }
}

export class Kind0Event extends NostrEvent {
  get parsedContent() {
    try {
      return pick(JSON.parse(this.content), [
        'lud06',
        'website',
        'nip05',
        'picture',
        'display_name',
        'about',
        'name',
      ]);
    } catch (_e) {
      return {};
    }
  }
}
