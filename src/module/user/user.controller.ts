import { AuthGuard } from '@common/guards/auth.guard';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from '@common/decorators/param.user.decorator';
import { Roles } from '@common/decorators/role.decorator';
import { RegisterDTO } from './user.dto';
import { RegisterPipe } from './user.pipe';
import { RoleGuard } from '@common/guards/role.guard';

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

  @Post('/')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  createUser(@Body(RegisterPipe) param: RegisterDTO, @User() user) {
    return this.userService.createUser(param, user);
  }
}
