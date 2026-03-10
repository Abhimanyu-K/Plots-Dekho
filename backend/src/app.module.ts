import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { PrismaModule } from './modules/common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
  ],
})
export class AppModule {}
