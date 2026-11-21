import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bullmq';
import { diskStorage } from 'multer';
import { DevAuthGuard } from '../auth/dev-auth.guard.js';

@Controller('admin/products')
@UseGuards(DevAuthGuard)
export class ImportsController {
  constructor(@InjectQueue('imports') private imports: Queue) {}

  @UseInterceptors(
    FileInterceptor('file', {
      // diskStorage not ram
      storage: diskStorage({ destination: '/tmp/uploads' }),
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  @Post('import')
  async upload(@UploadedFile() file: Express.Multer.File) {
    const job = await this.imports.add('products-csv', { path: file.path });
    return { jobId: job.id };
  }
}
