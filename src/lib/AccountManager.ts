import { Logger } from './Logger';
import { Account } from './Account';
import { RelayManager } from './RelayManager';
import { DbClient } from './DbClient';
import { Relay } from './Relay';
import EventProcessor from './EventProcessor';
import { Kind } from './NostrEvents';
import { User } from '@prisma/client';
import { UserRelaySource } from '../@types';

export class AccountManager {
  private _db: DbClient;
  private _logger: Logger;
  private _relayManager: RelayManager;
  private _eventProcessor: EventProcessor;
  private _accounts = new Map<string, Account>();

  constructor(opts: {
    db: DbClient;
    logger: Logger;
    relayManager: RelayManager;
    eventProcessor: EventProcessor;
  }) {
    this._db = opts.db;
    this._logger = opts.logger;
    this._relayManager = opts.relayManager;
    this._eventProcessor = opts.eventProcessor;
  }

  // TODO: Remove this
  get db() {
    return this._db;
  }

  // TODO: Remove this
  get relayManager() {
    return this._relayManager;
  }

  get accounts() {
    return this._accounts;
  }

  indexAllAccounts() {
    this._db.client.user.findMany({
      where: { is_account: true }
    }).then((accounts: User[]) => accounts.forEach(this.indexAccount))
  }

  private indexAccount(_account: User) {
    // Notes:
    // We need a big fat beefy indexer boss that merges subscriptions wherever it makes sense.
    // Whatever we do here, we're just dispatching the subscriptions.

    // 

    // 1. Index account metadata
    // 2. Index account posts
    // 3. Index follows metadata
    // 4. Index follows posts
    // 3. Index followers metadata
  }

  async setup() {
    this._logger.log('AccountManager setup');
    // const accts = await this._db.client.account.findMany();
    // accts.forEach(({ id, user_id: userId, pubkey, private_key }: any) => {
    //   const account = new Account({
    //     id,
    //     userId,
    //     db: this._db,
    //     logger: this._logger,
    //     pubkey: pubkey,
    //     privateKey: private_key ? private_key : undefined,
    //     relayManager: this._relayManager,
    //   });
    //   if (this._accounts.has(pubkey)) return;
    //   account.indexAccount();
    //   this._accounts.set(pubkey, account);
    // });
  }

  async addAccount(opts: {
    pubkey: string;
    relays: string[];
    privateKey?: string;
  }) {
    if (opts.privateKey) throw new Error('Not currently supported');
    const pubkey = Account.convertPubkeyToHex(opts.pubkey);
    // Upsert user
    const user = await this._db.client.user.upsert({
      where: { pubkey },
      update: {},
      create: {
        pubkey,
        is_account: true,
        ...(opts.privateKey ? { private_key: opts.privateKey } : {})
      },
    })
    return Promise.all(
      opts.relays.map(
        url =>
          new Promise(async (resolve, reject) => {
            // TODO: Wait until connected to create the relay?
            // or include last_connected + last_connected_attempt fields in the db
            // so we can track if it's a relay we've never connected to or a dud.
            let complete = false;
            const relay = await Relay.create({
              url,
              db: this._db,
              logger: this._logger,
              eventProcessor: this._eventProcessor,
              onDisconnect: () => {
                if (complete) resolve(relay)
                reject(new Error(`Relay disconnected without returning data ${url}`))
              },
              onError: (e: any) => { reject(e) }
            });
            // Note: Not using upsert because of timeout issues
            let userRelay = await this._db.client.userRelay.findUnique({ where: { user_id_relay_id: { user_id: user.id, relay_id: relay.id } } })
            if (!userRelay) {
              userRelay = await this._db.client.userRelay.create({
                data: {
                  user_id: user.id,
                  relay_id: relay.id,
                  source: UserRelaySource.MANUAL,
                }
              })
            }
            const syncUserRelay = async () => {
              if (!userRelay) return
              await this._db.client.userRelay.update({
                where: { id: userRelay.id },
                data: {
                  last_received: new Date(),
                }
              })
            }
            await relay.connect();
            // 10 second timeout if this doesn't respond quickly enough
            const timeout = setTimeout(async () => {
              await relay.disconnect()
              reject(new Error(`Relay took to long to respond ${url}`))
            }, 10000)
            // Collect as much information as possible about the account
            // from event kinds that only require 1 event.
            await relay.subscribeSync({
              onEvent: syncUserRelay,
              filters: [
                { kinds: [Kind.RecommendRelay], authors: [pubkey], limit: 1 },
              ],
            });
            await relay.subscribeSync({
              onEvent: syncUserRelay,
              filters: [
                { kinds: [Kind.Metadata], authors: [pubkey], limit: 1 },
              ],
            });
            await relay.subscribeSync({
              onEvent: syncUserRelay,
              filters: [
                { kinds: [Kind.Contacts], authors: [pubkey], limit: 1 },
              ],
            });
            clearTimeout(timeout)
            complete = true
            this._logger.log(`Finished collecting account info from relay ${url}`)
            await relay.disconnect();
            resolve(relay);
          })
      )
    )
      .then(relays => {
        // Wait until the EventProcessor events queue is empty
        while (true) {
          if (this._eventProcessor.eventQueue.length === 0) break;
        }
        // TODO: Start indexing the account.
        this._logger.log('TODO: Index added account', relays);
      })
      .catch(e => {
        throw new Error(`Failed to add account: ${e}`);
      });
    // 1. Fetch kind 1
    // 2.
  }

  // Add an account, if an account already exists in db we load it
  async oldAddAccount(opts: {
    pubkey: string;
    privateKey?: string;
    relays?: string[];
  }) {
    if (opts.privateKey) throw new Error('Not currently supported');

    // TODO: Do something with the relays if given

    // Ensure pubkey is in hex format
    // const hexPubkey = Account.convertPubkeyToHex(opts.pubkey);
    // let dbAccount: any | null;
    // dbAccount = await this._db.client.account.findUnique({
    //   where: { pubkey: opts.pubkey },
    // });
    // if (!dbAccount) {
    //   dbAccount = await this._db.createAccount({
    //     pubkey: hexPubkey,
    //   });
    // }
    // if (!dbAccount) throw new Error('Failed to create account');
    // const account = new Account({
    //   id: dbAccount.id,
    //   userId: dbAccount.user_id,
    //   db: this._db,
    //   logger: this._logger,
    //   pubkey: hexPubkey,
    //   relayManager: this._relayManager,
    // });
    // if (this._accounts.has(hexPubkey)) return dbAccount;
    // account.indexAccount();
    // this._accounts.set(hexPubkey, account);
    // return dbAccount;
  }
}
