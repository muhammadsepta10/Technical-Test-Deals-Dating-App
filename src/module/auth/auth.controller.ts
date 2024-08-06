import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LoginPipe } from './auth.pipe';
import { AppGuard } from '@common/guards/app.guard';
import { AppId } from '@common/decorators/param.app.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@common/config/multer';
import { User } from '@common/decorators/param.user.decorator';

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
  @UseInterceptors(FilesInterceptor('files', 3, multerOptions('journalist_doc')))
  @UseGuards(AppGuard)
  @ApiBody({
    type: RegisterDTO,
    required: true
  })
  @ApiConsumes('multipart/form-data')
  register(@User() user, @Body() param: RegisterDTO, @AppId() appId, @UploadedFiles() files: Express.Multer.File[]) {
    return this.authService.register(user, param, appId, files);
  }

  // @Post("/forgot-pass")
  // forgotPassword(@Body(ReqOtpPipe) param:ReqOtpDTO){
  //   // return this.authService.forgotPassword(param)
  // }
}
