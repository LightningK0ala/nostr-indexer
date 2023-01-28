import { DbClient } from '../../src/lib/DbClient';
import { Logger } from '../../src/lib/Logger';
import client from './prisma/client';

export class DbClientMock extends DbClient {
  constructor({ logger }: { logger: Logger }) {
    super({ dbPath: '', logger });
    this._db = client;
  }
}
