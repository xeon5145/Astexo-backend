import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, VerificationDto, verifiedDataDto ,forgotPasswordDto } from './auth.dto';

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

  @Post('get-token-data')
  async get_token_data(@Body() VerificationDto: VerificationDto) {
    return await this.authService.get_token_data(VerificationDto);
  }

  @Post('create-verified-account')
  async create_verified_account(@Body() verifiedDataDto: verifiedDataDto) {
    return await this.authService.create_verified_account(verifiedDataDto);
  }

  @Post('forgot-password')
  async forgot_password(@Body() forgotPasswordDto: forgotPasswordDto) {
    return await this.authService.forgot_password(forgotPasswordDto);
  }

}

