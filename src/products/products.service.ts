import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service.js';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto.js';
import { Product } from './product.entity.js';


@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private cache: CacheService,
  ) {}
// save product in db
  create(dto: CreateProductDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findOne(id: string) {

    const product = await this.cache.getOrSet(`product:${id}`, 300, () => {

      console.log('DB hit for', id); // الزم تظهر مرة واحدة بس تحت الحمل
      return this.repo.findOneBy({ id }); // بترجّع null لو مش موجود، وبنخزنها (Negative Caching)
    });

    if (!product) throw new NotFoundException();
    return product;

  }

// لما بنحدث منتج هنمسح النسخه القديمه من ريديس ونحط نسخه جديده 
  async update(id: string, dto: UpdateProductDto) {
    await this.repo.update(id, dto);
    await this.cache.del(`product:${id}`); // Invalidate بعد الكتابة
    return this.findOne(id);
  }

}
