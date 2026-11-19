import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { DataSource } from "typeorm";
import { User } from "./users/user.entity.js";
import { Product } from "./products/product.entity.js";
 
async function seed() {
const app = await NestFactory.createApplicationContext(AppModule);
const ds = app.get(DataSource);
await ds.getRepository(User).save([
{ email: 'admin@shop.dev', role: 'admin' },
{ email: 'support@shop.dev', role: 'support' },
{ email: 'customer@shop.dev', role: 'customer' },
]);
await ds.getRepository(Product).save(
Array.from({ length: 100 }, (_, i) => ({ name: `Product ${i + 1}`, 
priceCents: (i + 1) * 1000, stock: 50 })),
);
await app.close();
}
seed();