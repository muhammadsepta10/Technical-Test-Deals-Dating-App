import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import * as Joi from 'joi';
import { CheckinDTO, ListMeetingDTO, ParticipantMeetingDTO, SubmitMeetingDTO } from './meeting.dto';

export class SubmitMeetingPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<SubmitMeetingDTO>({
      endTime: Joi.string().isoDate().required(),
      startTime: Joi.string().isoDate().required(),
      location: Joi.string().required(),
      meetingName: Joi.string().required(),
      pic: Joi.string().required(),
      purpose: Joi.string().required(),
      type: Joi.number().equal(1, 2).required(),
      picContact: Joi.string().trim().required(),
      participant: Joi.when('type', {
        switch: [
          {
            is: 1,
            then: Joi.array().items(
              Joi.object<ParticipantMeetingDTO>({
                userId: Joi.number().greater(0).required(),
                email: Joi.string().optional().allow('', null),
                instanceName: Joi.string().optional().allow('', null),
                name: Joi.string().optional().allow('', null),
                waNo: Joi.string().optional().allow('', null)
              })
            )
          },
          {
            is: 2,
            then: Joi.array().items(
              Joi.object<ParticipantMeetingDTO>({
                userId: Joi.number().optional().allow(null, 0),
                email: Joi.string().email().required(),
                instanceName: Joi.string().required(),
                name: Joi.string().required(),
                waNo: Joi.string().trim().required()
              })
            )
          }
        ],
        otherwise: Joi.forbidden()
      })
    });
  }
}

export class CheckinPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<CheckinDTO>({
      participantId: Joi.string().uuid().required().trim(),
      meetingId: Joi.string().uuid().required().trim()
    });
  }
}
export class ListMeetingPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ListMeetingDTO>({
      endDate: Joi.string().isoDate().allow('', null).optional(),
      startDate: Joi.string().isoDate().allow('', null).optional(),
      limit: Joi.number().integer().min(1).max(100).default(10),
      page: Joi.number().integer().min(1).default(1),
      search: Joi.string().allow('', null).lowercase().optional(),
      status: Joi.number().integer().min(-1).max(2).default(-1).optional()
    });
  }
}
