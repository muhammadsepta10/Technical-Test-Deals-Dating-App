import { AuthGuard } from '@common/guards/auth.guard';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from '@common/decorators/param.user.decorator';
// import {UpdatePassPipe} from "./user.pipe";
// import {CreateUserDTO, UpdatePasswordDTO} from "src/dto/user.dto";
import { AppId } from '@common/decorators/param.app.decorator';
import { Roles } from '@common/decorators/role.decorator';

@Controller('/api/user')
@ApiTags('user')
@ApiSecurity('auth')
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/')
  @UseGuards(AuthGuard)
  getMe(@User() userId: number, @AppId() appId: number) {
    return this.userService.getMe(userId, appId);
  }

  @Get('/list')
  @UseGuards(AuthGuard)
  @Roles(['admin'])
  getListUser() {
    return this.userService.getListUser();
  }

  // @Put("/password")
  // @UseGuards(AuthGuard)
  // updatePass(@Body(UpdatePassPipe) param: UpdatePasswordDTO, @User() userId: number) {
  //     return this.userService.changePassword(param, userId)
  // }

  // @Post("/")
  // @UseGuards(AuthGuard)
  // @Roles(["admin"])
  // createUser(@Body() param: CreateUserDTO, @User() user) {
  //     return this.userService.createUser(param, user)
  // }
}
