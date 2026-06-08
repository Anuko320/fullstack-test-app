import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AdminUser } from './auth/entities/admin-user.entity';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite', 
      entities: [User, AdminUser],
      synchronize: true, 
      logging: false,
    }),

    AuthModule,
    UsersModule,
    SupportModule,
  ],
})
export class AppModule {}
