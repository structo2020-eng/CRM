import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() //  تخطي حارس الـ JWT لأن المستخدم غير مسجل دخول بعد
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return {
      message: 'Logged in successfully',
      data,
    };
  }

  @Public()
  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    const result = await this.authService.forgetPassword(forgetPasswordDto);
    return result; // الـ Interceptor سيتكفل بتنسيق الاستجابة
  }

  @Public()
  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const result = await this.authService.resetPassword(
      token,
      resetPasswordDto,
    );
    return result;
  }
}
