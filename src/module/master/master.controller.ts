import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { MasterService } from './master.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { Access } from '@common/decorators/param.access.decorator';
import { Roles } from '@common/decorators/role.decorator';
import { ListReasonDTO } from './master.dto';
import { ListReasonPipe } from './master.pipe';
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
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  listAccess() {
    return this.masterService.listAccess();
  }

  @Get('/bank')
  @UseGuards(AuthGuard)
  listBank() {
    return this.masterService.listBank();
  }

  @Get('/news/category')
  @UseGuards(AuthGuard)
  listNewsCategory() {
    return this.masterService.newsCategory();
  }

  @Get('/reason')
  lsitReason(@Query(ListReasonPipe) param: ListReasonDTO) {
    return this.masterService.invalidReason(param);
  }
}
