import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';

class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(8) password!: string;
  @IsString() name!: string;
}
class LoginDto {
  @IsEmail() email!: string;
  @MinLength(8) password!: string;
}

const AUTH_RATE_LIMIT = Number(process.env.AUTH_RATE_LIMIT ?? 60);

@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: AUTH_RATE_LIMIT, ttl: 60_000 } })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto.email, dto.password, dto.name); }
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }
}
