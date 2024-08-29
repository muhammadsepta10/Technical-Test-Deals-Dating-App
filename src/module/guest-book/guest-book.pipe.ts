import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import * as Joi from 'joi';
import { approveGuestDTO, requestGuestDTO } from './guest-book.dto';
import * as dayjs from 'dayjs';

export class ApproveGuestBookPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<approveGuestDTO>({
      guestBookId: Joi.string().uuid().required(),
      status: Joi.number().valid(1, 2).required(),
      reason: Joi.when('status', {
        is: 2,
        then: Joi.number().required()
      })
    });
  }
}

export class requestGuestPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<requestGuestDTO>({
      endTime: Joi.string().isoDate().required(),
      startTime: Joi.string().isoDate().required(),
      guestName: Joi.string().uppercase().required(),
      guestWaNo: Joi.string()
        .pattern(/^(08|628)\d+$/, { name: 'valid WA number' })
        .required()
        .custom((value, helpers) => {
          if (isNaN(Number(value))) {
            return helpers.error('custom.guestWaNoInvalid', {
              message: '"guestWaNo" must be a valid number'
            });
          }
          return value;
        }),
      instanceCategoryId: Joi.number().required(),
      instanceName: Joi.string().uppercase().required(),
      pic: Joi.string().required(),
      purpose: Joi.string().required(),
      workUnitId: Joi.number().required(),
      guestEmail: Joi.string().email().required()
    })
      .custom((value, helpers) => {
        const { startTime, endTime } = value;
        if (dayjs(startTime).unix() < dayjs().add(3, 'day').unix()) {
          return helpers.error('custom.startTimeMin', {
            message: '"startTime" minimum is h+3'
          });
        }
        if (dayjs(startTime).unix() > dayjs(endTime).unix()) {
          return helpers.error('custom.startTimeEndTime', {
            message: '"startTime" must be less than or equal to "endTime"'
          });
        }
        if (dayjs(endTime).unix() < dayjs(startTime).unix()) {
          return helpers.error('custom.endTimeStartTime', {
            message: '"endTime" must be greater than or equal to "startTime"'
          });
        }

        return value;
      })
      .messages({
        'custom.guestWaNoInvalid': '"guestWaNo" must be a valid number',
        'custom.startTimeMin': '"startTime" minimum is h+3',
        'custom.startTimeEndTime': '"startTime" must be less than or equal to "endTime"',
        'custom.endTimeStartTime': '"endTime" must be greater than or equal to "startTime"'
      });
  }
}
