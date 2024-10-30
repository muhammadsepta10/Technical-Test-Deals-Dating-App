import { AppConfigService } from '@common/config/api/config.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { SendMailDTO } from './mailer.dto';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { CommonService } from '@common/service/common.service';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { Notification } from 'src/db/project-db/entity/notification/notification.entity';

@Processor('send-mail-simpeg')
export class SendMailProcessor {
  private transport: Transporter<SMTPTransport.SentMessageInfo>;
  constructor(
    private appConfigService: AppConfigService,
    private projectDbConfigService: ProjectDbConfigService,
    private commonService: CommonService
  ) {
    this.transport = createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.appConfigService.MAIL_USER,
        pass: this.appConfigService.MAIL_PASS
      }
    });
  }

  @Process()
  async sendMail(job: Job<SendMailDTO>) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { email, subject, html, text, userId } = job.data;
      const generalParameter = await this.commonService.generalParameter();
      const mailBcc = generalParameter?.mailBcc || undefined;
      const send = await this.transport.sendMail(
        {
          html,
          subject,
          to: email,
          text,
          replyTo: `NO REPLY <${this.appConfigService.MAIL_USER}>`,
          bcc: mailBcc
        },
        (err, info) => {
          if (err) {
            throw new InternalServerErrorException(err);
          } else {
            return info;
          }
        }
      );
      await queryRunner.manager.insert(Notification, {
        userId: userId || null,
        content: text || '',
        html,
        title: subject || '',
        createdById: userId || null,
        status: 1
      });
      await queryRunner.commitTransaction();
      return send;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!error?.response || !error?.status) {
        throw new InternalServerErrorException(error);
      }
      throw new HttpException(error?.response, error?.status);
    } finally {
      await queryRunner.release();
    }
  }
}
