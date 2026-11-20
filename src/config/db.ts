import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";



export function buildTypeOrmOptions(cfg: ConfigService): TypeOrmModuleOptions {
  const common = {
    type: 'postgres' as const,
    autoLoadEntities: true, // أي Entity مسجلة بـ forFeature تتحمل لوحدها
    synchronize: true, // للتطوير بس! هنقفله يوم 7 ونستخدم Migrations
    extra: { max: 20, idleTimeoutMillis: 30000 },
    // لو Postgres لسه بتقوم، Nest يعيد المحاولة بدل ما يقع
    retryAttempts: 10,
    retryDelay: 3000,
  };

  const url = cfg.get<string>('DATABASE_URL');
  if (url) return { ...common, url };

  return {
    ...common,
    host: cfg.get<string>('DB_HOST') ?? 'localhost',
    port: Number(cfg.get<string>('DB_PORT') ?? 5432),
    username: cfg.get<string>('DB_USER') ?? 'shop',
    password: cfg.get<string>('DB_PASSWORD') ?? 'shop',
    database: cfg.get<string>('DB_NAME') ?? 'shopflow',
  };
}
