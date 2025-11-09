import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() AuthDto: AuthDto) {
    return await this.authService.login(AuthDto);
  }

  @Post('register')
  async register(@Body() AuthDto: AuthDto) {
    return await this.authService.register(AuthDto);
  }
}

