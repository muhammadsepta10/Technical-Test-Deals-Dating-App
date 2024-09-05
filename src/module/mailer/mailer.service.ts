import { Injectable } from '@nestjs/common';
import { NotifEmailDTO, SendMailDTO } from './mailer.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { existsSync, readFileSync } from 'fs';
import { path as appRootPath } from 'app-root-path';
import { MasterService } from '../master/master.service';

@Injectable()
export class MailerService {
  constructor(
    @InjectQueue('send-mail-simaspro')
    private sendMailQueue: Queue<SendMailDTO>,
    private masterService: MasterService
  ) {}
  async notifEmail(param: NotifEmailDTO) {
    const { email, receiverName, scriptName, userId } = param;
    let { params: replaceParams } = param;
    const script = await this.masterService.script().then(v => v?.[scriptName]);
    if (script) {
      let { body } = script;
      const { title, banner } = script;
      replaceParams = replaceParams instanceof Array && replaceParams.length > 0 ? replaceParams : [];
      for (let index = 0; index < replaceParams.length; index++) {
        const replaceParam = replaceParams[index];
        body = body.replace(`{{${index + 1}}}`, replaceParam);
      }
      let htmlTemplate = readFileSync(`${appRootPath}/assets/template-email.html`, { encoding: 'utf8' });
      htmlTemplate = htmlTemplate.replace('{{$banner}}', banner);
      htmlTemplate = htmlTemplate.replace('{{$title}}', title);
      htmlTemplate = htmlTemplate.replace('{{$body}}', body);
      htmlTemplate = htmlTemplate.replace('{{$receiver}}', receiverName);
      await this.sendMail({
        email,
        subject: title,
        html: htmlTemplate,
        userId
      });
    }
  }

  async sendMail(param: SendMailDTO) {
    const { email, subject, userId } = param;
    const text = param?.text || '';
    let html = param?.html || '';
    if (html) {
      const existFile = existsSync(`${appRootPath}/assets/${html}`);
      if (existFile) {
        html = readFileSync(`${appRootPath}/assets/${html}`, {
          encoding: 'utf8'
        });
      }
    }
    await this.sendMailQueue.add(
      {
        email,
        subject,
        html,
        text,
        userId
      },
      {
        attempts: 10,
        backoff: 5,
        timeout: 10000,
        removeOnComplete: true
      }
    );
  }
}
