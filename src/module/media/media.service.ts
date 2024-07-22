import { BadRequestException, Injectable } from '@nestjs/common';
import { ApproveMediaDTO, ListMediaDTO } from './media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { CommonService } from '@common/service/common.service';
import * as dayjs from 'dayjs';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { UserAccessRepository } from 'src/db/project-db/entity/user-access/user-access.repository';
import { MasterInvalidReasonRepository } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.repository';
import { UserJournalistDocRepository } from 'src/db/project-db/entity/user-journalist-doc/user-journalist-doc.repository';

@Injectable()
export class MediaService {
  constructor(private commonService: CommonService) {}
  @InjectRepository(UserJournalistRepository) private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(UserJournalistDocRepository) private userJournalistDocRepository: UserJournalistDocRepository;
  @InjectRepository(UserRepository) private userRepository: UserRepository;
  @InjectRepository(UserAccessRepository) private userAccessRepository: UserAccessRepository;
  @InjectRepository(MasterInvalidReasonRepository) private masterInvalidReasonRepository: MasterInvalidReasonRepository;

  async listMedia(param: ListMediaDTO) {
    const data = await this.userJournalistRepository.listJournalist(param);
    return data;
  }

  async approveMedia(param: ApproveMediaDTO, userId: number) {
    const { mediaId, reasonId, status } = param;
    const { USER_ACCESS_ID, USER_APP_ID } = await this.commonService.generalParameter();
    const userJournal = await this.userJournalistRepository.findOne({
      where: { uuid: mediaId },
      select: ['id', 'status', 'media_name']
    });
    if (!userJournal) {
      throw new BadRequestException('Invalid Media');
    }
    if (userJournal?.status != 0) {
      throw new BadRequestException('Already verify');
    }
    if (status == 1) {
      // approved
      let journalistId = '';
      let isUnique = true;
      while (isUnique) {
        journalistId = (
          await this.commonService.randString(5, '34679QWERTYUPADFGHJKLXCVNM', `${dayjs().unix()}`)
        )?.toLowerCase();
        const existJournalId = await this.userJournalistRepository.findOne({
          where: { journalist_id: journalistId },
          select: ['id']
        });
        if (!existJournalId) {
          isUnique = false;
        }
      }
      const password = await this.commonService.randString(8, '34679QWERTYUPADFGHJKLXCVNM', '');
      const hashPassword = await this.commonService.bcrpytSign(password);
      const user = await this.userRepository.insert({
        name: userJournal?.media_name,
        username: journalistId,
        password: hashPassword
      });
      await this.userAccessRepository.insert({
        userId: user.identifiers[0].id,
        masterAccessId: USER_ACCESS_ID,
        masterAppId: USER_APP_ID
      });
      await this.userJournalistRepository.update(
        { id: userJournal.id },
        { status: 2, journalist_id: journalistId, userId: user.identifiers[0].id, approvedById: userId }
      );
      // send email
      // ..........
    }
    if (status == 2) {
      const reason = await this.masterInvalidReasonRepository.findOne({
        where: { status: 1, id: reasonId },
        select: ['id']
      });
      if (!reason) {
        throw new BadRequestException('Invalid Reason');
      }
      await this.userJournalistRepository.update(
        { id: userJournal.id },
        { status: 3, masterInvalidReasonId: reasonId }
      );
      await this.userJournalistDocRepository.update({ userJournalistId: userJournal.id }, { status: 0 });
      // send email
    }
  }

  async detailMedia(id: string) {
    return this.userJournalistRepository.detail(id);
  }
}
