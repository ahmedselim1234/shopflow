import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mssql',
        host: cfg.getOrThrow('DB_HOST'),
        port: Number(cfg.getOrThrow('DB_PORT')),
        username: cfg.getOrThrow('DB_USER'),
        password: cfg.getOrThrow('DB_PASSWORD'),
        database: cfg.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ﻟﻠﺘﻄﻮﻳﺮ ﺑﺲ! ﻓﻲ Production ﺑﻨﺴﺘﺨﺪم Migrations
        options: { encrypt: false, trustServerCertificate: true },
        pool: { max: 20, idleTimeoutMillis: 30000 },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
