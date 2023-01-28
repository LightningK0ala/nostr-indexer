import { RelayManager } from '../src/lib/RelayManager';
import { logger, relayInit } from './mocks';
import { prismaMock } from './mocks/prisma/singleton';
import { DbClientMock } from './mocks/DbClientMock';
import { sha1Hash } from '../src/utils/crypto';

let relayManager: RelayManager;
let db = new DbClientMock({ logger });

describe('RelayManager', () => {
  beforeEach(() => {
    relayManager = new RelayManager({
      db,
      logger,
      relayInit,
    });
  });

  it('no relays when it is instantiated', () => {
    expect(relayManager.relays.size).toBe(0);
  });

  it('.addRelay', async () => {
    prismaMock.relay.create.mockResolvedValue({
      id: 0,
      url: 'foo',
      added_at: new Date(),
    });
    await relayManager.addRelay('foo');
    // relay is added
    expect(relayManager.relays.size).toBe(1);
  });

  it('.addSubscription, .hasSubscription', () => {
    const filters = [{ kinds: [0] }];
    expect(relayManager.hasSubscription(filters)).toBe(false);
    const id = relayManager.addSubscription({
      filters,
      closeOnEose: false,
    });
    // subscription is added
    expect(relayManager.subscriptions.size).toBe(1);
    // id is a hash of stringified filters
    expect(id).toBe(sha1Hash(JSON.stringify(filters)));
    expect(relayManager.hasSubscription(filters)).toBe(true);
  });

  it.todo('subscriptions are run when relay connects');
  it.todo('subscriptions are run when added');
});
