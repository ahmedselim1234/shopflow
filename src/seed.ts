import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { Product } from './products/product.entity.js';
import { User } from './users/user.entity.js';
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);
3 / 107
  const users = await ds.getRepository(User).save([
    { email: 'admin@shop.test', role: 'admin' },
    { email: 'support@shop.test', role: 'support' },
    { email: 'customer@shop.test', role: 'customer' },
  ]);
  const products = Array.from({ length: 100 }, (_, i) => ({
    name: `Product ${i + 1}`,
    priceCents: 1000 + i * 50,
    stock: 100,
  }));
  await ds.getRepository(Product).save(products);
  console.log('Users:', users.map((u) => `${u.role}=${u.id}`).join('\n'));
  await app.close();
}
seed();