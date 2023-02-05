// This class is a wrapper around the Prisma client. It is used to abstract away
// the Prisma client and provide a more convenient interface for the rest of the
// application. It also keeps the code tidy by not having to import the Prisma
// client in every file that needs to access the database. If other database
// clients are added in the future, this class can be used to abstract away the
// differences between them.
import { PrismaClient, Relay } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Logger } from './Logger';

export type DbRelay = Relay;

export class DbClient {
  private _logger: Logger;
  protected _db: PrismaClient;

  constructor({ logger, dbPath }: { logger: Logger; dbPath: string }) {
    this._logger = logger;
    this._db = new PrismaClient({
      datasources: { db: { url: `file:${dbPath}?socket_timeout=30&&connection_limit=1` } },
    });
  }

  // This allows us to access the prisma client directly if needed.
  get client() {
    return this._db;
  }

  // TODO: Fix
  async createAccount(_opts: { pubkey: string }) {
    return null
  }

  // TODO: Fix
  async createRelay(_opts: { url: string }) {
    return null
  }

  async createMetadata({
    userId,
    event,
    metadata,
  }: {
    userId: number;
    event: any;
    metadata: any;
  }) {
    try {
      const result = await this._db.$transaction(async tx => {
        // 1. Check if user has metadata, if not create new metadata and event. Return.
        const existingMetadata = await tx.metadata.findUnique({
          where: { user_id: userId },
          include: { event: true },
        });
        if (!existingMetadata) {
          const { id: eventId } = await tx.event.create({
            data: event,
          });
          return tx.metadata.create({
            data: {
              user_id: userId,
              event_id: eventId,
              ...metadata,
            },
          });
        }

        // 2. If event exists return.
        if (existingMetadata.event.event_id == event.id)
          return existingMetadata;
        // 3. If event is older than current return.
        if (existingMetadata.event.event_created_at.getTime() > event.created_at)
          return existingMetadata;

        // 3. Otherwise, create a new event, delete the old and update the metadata record.
        const { id: eventId } = await tx.event.create({
          data: event,
        });
        const updatedMetadata = await tx.metadata.update({
          where: {
            id: existingMetadata.id,
          },
          data: {
            event_id: eventId,
            ...metadata,
          },
        });
        await tx.event.delete({ where: { id: existingMetadata.event_id } });
        return updatedMetadata;
      });

      return result;
    } catch (e) {
      // @ts-ignore
      if (e instanceof PrismaClientKnownRequestError) {
        // Unique constraint error, ignore
        if (e.code === 'P2002') return;
        this._logger.log(
          // @ts-ignore
          `Unexpected db client error creating metadata ${e.code} ${e.message}`
        );
      } else {
        this._logger.log(
          // @ts-ignore
          `Unexpected error creating metadata ${e.code} ${e.message}`
        );
      }
      throw Error('Failed to createMetadata');
    }
  }

  getEvent(event_id: string) {
    return this._db.event.findFirst({ where: { event_id } });
  }

  getEventCount() {
    return this._db.event.count();
  }

  disconnect() {
    return this._db.$disconnect();
  }
}
