import { BadRequestException, Injectable } from '@nestjs/common';
import { ApproveMediaDTO, ListMediaDTO, ProcessApprovedMediaDTO } from './media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MasterInvalidReasonRepository } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.repository';

@Injectable()
export class MediaService {
  constructor(@InjectQueue('approved-simaspro') private approvedMediaQueue: Queue<ProcessApprovedMediaDTO>) {}
  @InjectRepository(UserJournalistRepository) private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(MasterInvalidReasonRepository) private masterInvalidReasonRepository: MasterInvalidReasonRepository;

  async listMedia(param: ListMediaDTO) {
    const data = await this.userJournalistRepository.listJournalist(param);
    return data;
  }

  async approveMedia(param: ApproveMediaDTO, userId: number) {
    const { mediaId, reasonId, status } = param;
    const userJournal = await this.userJournalistRepository.findOne({
      where: { uuid: mediaId },
      select: ['id', 'status', 'media_name', 'email']
    });
    if (!userJournal) {
      throw new BadRequestException('Invalid Media');
    }
    if (userJournal?.status != 0) {
      throw new BadRequestException('Already Approved');
    }
    if (![1, 2].includes(status)) {
      throw new BadRequestException('Invalid Status');
    }
    if (status === 1) {
      await this.approvedMediaQueue.add({
        mediaName: userJournal?.media_name,
        reasonName: '',
        status,
        userId,
        userJournalEmail: userJournal?.email,
        userJournalId: userJournal?.id,
        reasonId: 0
      });
    }
    if (status === 2) {
      const checkReason = await this.masterInvalidReasonRepository.findOne({
        where: { id: reasonId },
        select: ['id', 'name']
      });
      if (!checkReason) {
        throw new BadRequestException('ReasonId Not Valid');
      }
      await this.approvedMediaQueue.add({
        mediaName: userJournal?.media_name,
        reasonName: checkReason?.name,
        status,
        userId,
        userJournalEmail: userJournal?.email,
        userJournalId: userJournal?.id,
        reasonId
      });
    }
  }

  async detailMedia(id: string) {
    return this.userJournalistRepository.detail(id);
  }
}
