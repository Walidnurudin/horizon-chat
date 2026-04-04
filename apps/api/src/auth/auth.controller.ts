import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signUpDto: Record<string, any>) {
    return this.authService.signIn(signUpDto.username, signUpDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() signUpDto: Record<string, any>) {
    return this.authService.register(signUpDto.username, signUpDto.password);
  }
}

