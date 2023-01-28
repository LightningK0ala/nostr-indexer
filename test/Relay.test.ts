import { logger } from './mocks';
import { Relay } from '../src/lib/Relay';
import {
  Filter,
  SubscriptionOptions,
  RelayEvent,
} from '../src/@types/nostr-tools-shim';
jest.mock('../src/lib/Logger');

const relayInit = jest.fn().mockImplementation((url: string) => {
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

let relay: Relay;

describe('Relay', () => {
  beforeEach(() => {
    relay = new Relay({
      id: 1,
      url: 'testUrl',
      logger,
      relayInit,
    });
  });

  it('connected true when relay connects', async () => {
    expect(relay.connected).toBeFalsy();
    await relay.connect();
    expect(relay.connected).toBeTruthy();
  });
});
