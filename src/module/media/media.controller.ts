import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { Roles } from '@common/decorators/role.decorator';
import { ApproveMediaDTO, ApproveNewsDTO, ListMediaDTO, SubmitNewsDTO } from './media.dto';
import { ApproveMediaPipe, ApproveNewsPipe, ListMediaPipe } from './media.pipe';
import { User } from '@common/decorators/param.user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@common/config/multer';

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

  @Post('/news/approve')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(['admin'])
  async approveNews(@Body(ApproveNewsPipe) param: ApproveNewsDTO, @User() user) {
    return this.mediaService.approveNews(param, user);
  }

  @Get('/news')
  @UseGuards(AuthGuard)
  async listNews(@Query(ListMediaPipe) param: ListMediaDTO) {
    return this.mediaService.listNews(param);
  }

  @Get('/news/:id')
  @UseGuards(AuthGuard)
  async detailNews(@Param('id') id: string) {
    return this.mediaService.detailNews(id);
  }

  @Post('/news')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 3, multerOptions('news_doc')))
  @ApiBody({
    type: SubmitNewsDTO,
    required: true
  })
  @ApiConsumes('multipart/form-data')
  async listNewsVerify(@Body() param: SubmitNewsDTO, @User() userId, @UploadedFiles() files: Express.Multer.File[]) {
    return this.mediaService.submitNews(param, files, userId);
  }
}
