import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MailerModule } from './mailer/mailer.module';
import {jwtConfig } from './common/jwt/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    JwtModule.register({
      ...jwtConfig,
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
    }),
    DatabaseModule,
    AuthModule,
    MailerModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
