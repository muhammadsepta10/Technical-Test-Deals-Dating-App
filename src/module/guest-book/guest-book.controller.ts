import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GuestBookService } from './guest-book.service';
import { requestGuestPipe } from './guest-book.pipe';
import { requestGuestDTO } from './guest-book.dto';
import { AuthGuard } from '@common/guards/auth.guard';
import { ListMediaDTO } from '../media/media.dto';
import { ListMediaPipe } from '../media/media.pipe';

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
}
