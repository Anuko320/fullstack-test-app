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

const SEED_USERS = [
  {
    id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz',
    city: 'Gwenborough'
  },
  {
    id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv',
    city: 'Wisokyburgh'
  },
  {
    id: 3, name: 'Clementine Bauch', email: 'Nathan@yesenia.net',
    city: 'McKenziehaven'
  },
  {
    id: 4, name: 'Patricia Lebsack', email: 'Julianne.OConner@kory.org',
    city: 'South Elvis'
  },
  {
    id: 5, name: 'Chelsey Dietrich', email: 'Lucio_Hettinger@annie.ca',
    city: 'Roscoeview'
  },
  {
    id: 6, name: 'Mrs. Dennis Schulist', email: 'Karley_Dach@jasper.info',
    city: 'South Christy'
  },
  {
    id: 7, name: 'Kurtis Weissnat', email: 'Telly.Hoeger@billy.biz',
    city: 'Howemouth'
  },
  {
    id: 8, name: 'Nicholas Runolfsdottir V', email: 'Sherwood@rosamond.me',
    city: 'Aliyaview'
  },
  {
    id: 9, name: 'Glenna Reichert', email: 'Chaim_McDermott@dana.io',
    city: 'Bartholomebury'
  },
  {
    id: 10, name: 'Clementina DuBuque', email: 'Rey.Padberg@karina.biz',
    city: 'Lebsackbury'
  },
];

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
    for (const userData of SEED_USERS) {
      await userRepo.save(userRepo.create(userData));
    }
    console.log(`✅ Seeded ${SEED_USERS.length} users`);
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
