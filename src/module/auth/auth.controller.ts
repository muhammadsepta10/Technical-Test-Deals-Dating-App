import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LoginPipe, RegisterPipe } from './auth.pipe';

@Controller('/api/auth')
@ApiTags('auth')
@ApiSecurity('auth')
@ApiSecurity('appAuth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/login')
  async login(@Body(LoginPipe) param: LoginDTO) {
    return this.authService.login(param);
  }

  @Post('/register')
  async register(@Body(RegisterPipe) param: RegisterDTO) {
    return this.authService.register(param);
  }
}
