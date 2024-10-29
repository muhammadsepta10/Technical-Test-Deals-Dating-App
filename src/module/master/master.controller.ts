import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { MasterService } from './master.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { Access } from '@common/decorators/param.access.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { User } from '@common/decorators/param.user.decorator';

@Controller('/api/master')
@ApiTags('Master')
@ApiSecurity('auth')
@ApiSecurity('appAuth')
@UseInterceptors(TransformInterceptor)
export class MasterController {
  constructor(private masterService: MasterService) {}

  @Get('/menu')
  @UseGuards(AuthGuard)
  listMenu(@Access() access) {
    return this.masterService.listMenu(access);
  }

  @Get('/access')
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles(['admin'])
  listAccess() {
    return this.masterService.listAccess();
  }

  @Get('/cabang')
  @UseGuards(AuthGuard)
  listCabang() {
    return this.masterService.listCabang();
  }

  @Get('/permit-type/quota')
  @UseGuards(AuthGuard)
  permitQuota(@User() userId) {
    return this.masterService.permitQuota(userId);
  }

  @Get('/permission-category')
  permissionCategory() {
    return this.masterService.permissionCategory();
  }
}
