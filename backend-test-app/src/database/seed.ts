import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { AdminUser } from '../auth/entities/admin-user.entity';

config();

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, AdminUser],
  synchronize: true,
});

const CITIES = [
  'New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Madrid', 'Rome',
  'Amsterdam', 'Vienna', 'Prague', 'Warsaw', 'Budapest', 'Bucharest',
  'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Dublin', 'Lisbon',
  'Athens', 'Istanbul', 'Moscow', 'Kyiv', 'Minsk', 'Almaty', 'Astana',
];

const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard',
  'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda',
  'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa',
  'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Emily', 'Donna',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
];

function generateUsers(count: number) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const city = CITIES[i % CITIES.length];
    users.push({
      name: `${firstName} ${lastName}`,
      email: `user${i}@example.com`,
      city,
      phone: `+1-${String(i).padStart(3, '0')}-${String(i * 7).padStart(4, '0')}`,
      website: `user${i}.example.com`,
    });
  }
  return users;
}

async function seed() {
  console.log('🌱 Starting database seed...');
  await AppDataSource.initialize();
  console.log('✅ SQLite database ready');

  const adminRepo = AppDataSource.getRepository(AdminUser);
  const existingAdmin = await adminRepo.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await adminRepo.save(adminRepo.create({ username: 'admin', password: hashedPassword }));
    console.log('✅ Admin user created (admin/admin)');
  } else {
    console.log('ℹ️  Admin already exists, skipping');
  }

  const userRepo = AppDataSource.getRepository(User);
  const existingCount = await userRepo.count();
  if (existingCount === 0) {
    const users = generateUsers(100);
    for (const userData of users) {
      await userRepo.save(userRepo.create(userData));
    }
    console.log(`✅ Seeded 100 users`);
  } else {
    console.log(`ℹ️  Users already exist (${existingCount}), skipping`);
  }

  await AppDataSource.destroy();
  console.log('🎉 Done!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});