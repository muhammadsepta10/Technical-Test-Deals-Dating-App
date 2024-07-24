import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { Roles } from '@common/decorators/role.decorator';
import { ApproveMediaDTO, ListMediaDTO } from './media.dto';
import { ApproveMediaPipe, ListMediaPipe } from './media.pipe';
import { User } from '@common/decorators/param.user.decorator';

@Controller('/api/media')
@ApiTags('media')
@ApiSecurity('auth')
@ApiSecurity('appAuth')
@UseInterceptors(TransformInterceptor)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get('/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  async listmedia(@Query(ListMediaPipe) param: ListMediaDTO) {
    return this.mediaService.listMedia(param);
  }

  @Get('/detail/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  async detailMedia(@Param('id') id: string) {
    return this.mediaService.detailMedia(id);
  }

  @Post('/approve')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  async approveMedia(@Body(ApproveMediaPipe) param: ApproveMediaDTO, @User() user) {
    return this.mediaService.approveMedia(param, user);
  }
}
