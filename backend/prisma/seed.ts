import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test Seeker account
  const seekerPassword = await bcrypt.hash('Test12345678', 10);
  const seeker = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Seeker',
      password: seekerPassword,
      role: UserRole.SEEKER,
      isVerified: true,
      emailVerified: true,
    },
  });
  console.log(`Created seeker: ${seeker.email}`);

  // Create test Owner account
  const ownerPassword = await bcrypt.hash('Owner12345', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Test Owner',
      password: ownerPassword,
      role: UserRole.OWNER,
      isVerified: true,
      emailVerified: true,
    },
  });
  console.log(`Created owner: ${owner.email}`);

  // Create test Admin account
  const adminPassword = await bcrypt.hash('Admin12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
      emailVerified: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
