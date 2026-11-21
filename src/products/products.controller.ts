import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto.js';
import { DevAuthGuard } from '../auth/dev-auth.guard.js';

@Controller('products')
export class ProductsController {

  constructor(private products: ProductsService) {}
  
  @Get(':id') 
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @Post()
  @UseGuards(DevAuthGuard) 
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  @UseGuards(DevAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string,@Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }
}
