// WARN: Using nostr-tools Filter and other types breaks the build
// when dependency is used elsewhere so type defined manually

export type RelayEvent = 'connect' | 'disconnect' | 'error' | 'notice';

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
  ChannelMuteUser = 44
}

export type Event = {
  id?: string
  sig?: string
  kind: Kind
  tags: string[][]
  pubkey: string
  content: string
  created_at: number
}

export type NostrRelay = {
  url: string;
  status: number;
  connect: () => Promise<void>;
  close: () => Promise<void>;
  sub: (filters: Filter[], opts?: SubscriptionOptions) => Sub;
  publish: (event: Event) => Pub;
  on: (type: RelayEvent, cb: any) => void;
  off: (type: RelayEvent, cb: any) => void;
};

export type Filter = {
  ids?: string[];
  kinds?: number[];
  authors?: string[];
  since?: number;
  until?: number;
  limit?: number;
  [key: `#${string}`]: string[];
};

export type Pub = {
  on: (type: 'ok' | 'seen' | 'failed', cb: any) => void;
  off: (type: 'ok' | 'seen' | 'failed', cb: any) => void;
};

// WARN: Likewise using Sub will also break
export type Sub = {
  sub: (filters: Filter[], opts: SubscriptionOptions) => Sub;
  unsub: () => void;
  on: (type: 'event' | 'eose', cb: any) => void;
  off: (type: 'event' | 'eose', cb: any) => void;
};

export type SubscriptionOptions = {
  skipVerification?: boolean;
  id?: string;
};

export interface RelayInit {
  (
    url: string,
    alreadyHaveEvent: (id: string) => boolean = () => false
  ): NostrRelay;
}
