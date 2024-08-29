import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GuestBookService } from './guest-book.service';
import { ApproveGuestBookPipe, requestGuestPipe } from './guest-book.pipe';
import { approveGuestDTO, requestGuestDTO } from './guest-book.dto';
import { AuthGuard } from '@common/guards/auth.guard';
import { ListMediaDTO } from '../media/media.dto';
import { ListMediaPipe } from '../media/media.pipe';
import { User } from '@common/decorators/param.user.decorator';

@Controller('/api/guest-book')
@ApiTags('guest-book')
@ApiSecurity('auth')
@ApiSecurity('appAuth')
@UseInterceptors(TransformInterceptor)
export class GuestBookController {
  constructor(private guestBookService: GuestBookService) {}

  @Post('/')
  requestGuest(@Body(requestGuestPipe) param: requestGuestDTO) {
    return this.guestBookService.requestGuest(param);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  listGuestBook(@Query(ListMediaPipe) param: ListMediaDTO) {
    return this.guestBookService.listGuestBook(param);
  }

  @Get('/:id')
  detailGuestBook(@Param('id') id: string) {
    return this.guestBookService.detailGuestBook(id);
  }

  @Post('/approve')
  @UseGuards(AuthGuard)
  approveGuestBook(@Body(ApproveGuestBookPipe) param: approveGuestDTO, @User() userId: number) {
    return this.guestBookService.approveGuestBook(param, userId);
  }
}
