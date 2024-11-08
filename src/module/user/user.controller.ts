import { AuthGuard } from '@common/guards/auth.guard';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from '@common/decorators/param.user.decorator';
import { Roles } from '@common/decorators/role.decorator';

@Controller('/api/user')
@ApiTags('user')
@ApiSecurity('auth')
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/')
  @UseGuards(AuthGuard)
  getMe(@User() userId: number) {
    return this.userService.getMe(userId);
  }

  @Get('/list')
  @UseGuards(AuthGuard)
  @Roles(['admin'])
  getListUser() {
    return this.userService.getListUser();
  }
}
