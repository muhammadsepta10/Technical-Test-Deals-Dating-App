import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendMailDTO } from './mailer.dto';

@Controller('mailer')
export class MailerController {
  constructor(private mailerService: MailerService) {}

  @Post('/')
  async sendMail(@Body() param: SendMailDTO) {
    return this.mailerService.sendMail(param);
  }
}
