import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { RateLimit } from '../rate-limit/rate-limit.guard.js';

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

@Controller('auth')
export class AuthController {
 
  @Post('login')
  @RateLimit(5, 15 * 60, 'ip+body.email') // 5 محاوالت كل 15 دقيقة لكل IP + إيميل
  login(@Body() dto: LoginDto) {
    return { ok: true };
  }
  
}
