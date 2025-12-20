// prisma/seed.ts
import { PrismaClient, Priority, Status, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Starting seed...');

  // Create admin user with hashed password
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create regular user
  const userPassword = await hashPassword('User123!');
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
      emailVerified: true,
    },
  });
  console.log(`Created regular user: ${user.email}`);

  // Create a team
  const team = await prisma.team.create({
    data: {
      name: 'Development Team',
      description: 'Main development team',
      isPublic: true,
    },
  });
  console.log(`Created team: ${team.name}`);

  // Add users to team
  await prisma.teamMember.createMany({
    data: [
      {
        userId: admin.id,
        teamId: team.id,
        role: 'ADMIN',
      },
      {
        userId: user.id,
        teamId: team.id,
        role: 'MEMBER',
      },
    ],
  });
  console.log('Added users to team');

  // Create a project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign company website',
      color: '#3B82F6',
      creatorId: admin.id,
      teamId: team.id,
    },
  });
  console.log(`Created project: ${project.name}`);

  console.log('Seeding completed successfully!');
}

// Correct way to handle the global process object
main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1); // process is global, no import needed
  })
  .finally(async () => {
    await prisma.$disconnect();
  });