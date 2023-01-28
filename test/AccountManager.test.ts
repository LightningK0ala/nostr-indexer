import { AccountManager } from '../src/lib/AccountManager';
import { RelayManager } from '../src/lib/RelayManager';
import { logger, relayInit } from './mocks';
import { prismaMock } from './mocks/prisma/singleton';
import { DbClientMock } from './mocks/DbClientMock';

let accountManager: AccountManager;
let relayManager: RelayManager;
let db = new DbClientMock({ logger });

describe('AccountManager', () => {
  beforeEach(() => {
    relayManager = new RelayManager({
      db,
      logger,
      relayInit,
    });
    accountManager = new AccountManager({
      db,
      logger,
      relayManager,
    });
  });

  it('.addAccount', async () => {
    prismaMock.account.create.mockResolvedValue({
      id: 0,
      user_id: 0,
      pubkey: 'foo',
      added_at: new Date(),
      private_key: null,
    });
    await accountManager.addAccount({ pubkey: 'foo' });
    expect(accountManager.accounts.size).toBe(1);
  });

  it.todo('validate pubkey');
});
