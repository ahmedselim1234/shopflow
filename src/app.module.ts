import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [

    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'mssql',
    //     host: config.get<string>('DB_HOST'),
    //     port: Number(config.get<string>('DB_PORT')),
    //     username: config.get<string>('DB_USER'),
    //     password: config.get<string>('DB_PASSWORD'),
    //     database: config.get<string>('DB_NAME'),

    //     autoLoadEntities: true,
    //     synchronize: true,

    //     options: {
    //       encrypt: false,
    //       trustServerCertificate: true,
    //     },
    //   }),
    // }),
  ],
  
})
export class AppModule {}
