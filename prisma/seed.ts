import { PrismaClient } from '../node_modules/.prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${process.env.DATABASE_URL}` },
  },
});

async function main() {
  await prisma.relay.create({ data: { url: 'wss://nostr.zebedee.cloud' } });
  await prisma.relay.create({ data: { url: 'wss://jiggytom.ddns.net' } });
  await prisma.relay.create({ data: { url: ' wss://nostr.fmt.wiz.biz' } });
  await prisma.relay.create({ data: { url: 'wss://nostr.onsats.org' } });
  await prisma.relay.create({ data: { url: 'wss://relay.damus.io' } });
  await prisma.relay.create({ data: { url: 'wss://nostr-pub.wellorder.net' } });
  await prisma.relay.create({ data: { url: 'wss://nost.lol' } });
  // LK key
  let pubkey;
  pubkey = '63c3f814e38f0b5bd64515a063791a0fdfd5b276a31bae4856a16219d8aa0d1f';
  await prisma.account.create({
    data: { user: { create: { pubkey } }, pubkey },
  });
  // Jack's pubkey
  // pubkey = '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2';
  // await prisma.account.create({
  //   data: { user: { create: { pubkey } }, pubkey },
  // });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Done seeding database');
  })
  .catch(async e => {
    console.error(e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
