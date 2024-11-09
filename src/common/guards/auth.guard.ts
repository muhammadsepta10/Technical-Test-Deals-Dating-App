import { CommonService } from '@common/service/common.service';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual } from 'typeorm';
import * as dayjs from 'dayjs';
import { LoginSessionRepository } from 'src/db/project-db/entity/login-session/login-session.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly commonService: CommonService) {}

  @InjectRepository(LoginSessionRepository)
  private loginSessionRepository: LoginSessionRepository;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const { authorization } = req.headers;
      const data = await this.commonService.decryptedAuthToken(authorization);
      const { sessionId, accessId } = data;
      const { userId, isValid } = await this._validate(sessionId);
      if (isValid) {
        req.userId = userId;
        req.accessId = accessId;
      }
      return isValid;
    } catch (error) {
      return false;
    }
  }

  private async _validate(sessionId: string) {
    const curDate = dayjs().unix().toString();
    const loginSession = await this.loginSessionRepository.findOne({
      where: { sessionId, expired: MoreThanOrEqual(curDate) },
      select: ['userId']
    });
    console.log('loginSess', loginSession);
    return {
      userId: loginSession?.userId,
      isValid: loginSession ? true : false
    };
  }
}
