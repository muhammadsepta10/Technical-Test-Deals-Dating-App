import { AuthGuard } from '@common/guards/auth.guard';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from '@common/decorators/param.user.decorator';
// import {UpdatePassPipe} from "./user.pipe";
// import {CreateUserDTO, UpdatePasswordDTO} from "src/dto/user.dto";
import { AppId } from '@common/decorators/param.app.decorator';
import { Roles } from '@common/decorators/role.decorator';
import { RoleGuard } from '@common/guards/role.guard';
import { CreateUserDTO } from './user.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@common/config/multer';
import { CreateUserPipe } from './user.pipe';

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

  @Post('/')
  @UseInterceptors(FilesInterceptor('files', 3, multerOptions('user')))
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  createUser(@Body(CreateUserPipe) param: CreateUserDTO, @User() user, @UploadedFile() files: Express.Multer.File) {
    return this.userService.createUser(param, user, files);
  }
}
