import {
  Filter,
  RelayEvent,
  SubscriptionOptions,
} from '../../src/@types/nostr-tools-shim';
import { Config } from '../../src/lib/Config';
import { Logger } from '../../src/lib/Logger';

export const relayInit = jest.fn().mockImplementation((url: string) => {
  return {
    url,
    status: 0,
    connect: jest.fn().mockResolvedValue({}),
    close: () => {},
    sub: (_filters: Filter[], _opts?: SubscriptionOptions) => {},
    publish: (_event: Event) => {},
    on: (_type: RelayEvent, _cb: any) => {},
    off: (_type: RelayEvent, _cb: any) => {},
  };
});

const config = new Config({ dbPath: 'mock', debug: true });

export const logger = new Logger({ config });
