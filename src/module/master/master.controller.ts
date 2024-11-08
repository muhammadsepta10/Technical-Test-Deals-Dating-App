import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { MasterService } from './master.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { Access } from '@common/decorators/param.access.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';

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
}
