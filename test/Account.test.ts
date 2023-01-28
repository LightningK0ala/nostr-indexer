import { Account } from '../src/lib/Account';
import { RelayManager } from '../src/lib/RelayManager';
import { relayInit, logger } from './mocks';
import { DbClientMock } from './mocks/DbClientMock';

let account: Account;
let relayManager: RelayManager;
let db = new DbClientMock({ logger });

describe('Account', () => {
  beforeEach(() => {
    relayManager = new RelayManager({
      db,
      logger,
      relayInit,
    });
    account = new Account({
      id: 0,
      userId: 0,
      db,
      logger,
      relayManager,
      pubkey: 'foo',
      privateKey: 'bar',
    });
  });

  // this is just a silly test to prevent ts lint errors until we have more tests
  it('can get id', () => {
    expect(account.id).toBe(0);
  });
  // expect(relayManager.subscriptions.size).toBe(0);
  // account.indexContactList();
  // expect(relayManager.subscriptions.size).toBe(1);
});
