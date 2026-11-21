import { TypeOrmModule } from "@nestjs/typeorm";
import { ImportsController } from "./imports.controller.js";
import { ImportsProcessor } from "./imports.processor.js";
import { Product } from "../products/product.entity.js";
import { Order } from "../orders/order.entity.js";
import { ExportController } from "./export.controller.js";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order]), BullModule.registerQueue({ name: 'imports' })],
  controllers: [ImportsController, ExportController],
  providers: [ImportsProcessor],
})
export class ImportsModule {}