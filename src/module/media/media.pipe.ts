import * as Joi from 'joi';
import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import { ApproveMediaDTO, ApproveNewsDTO, ListMediaDTO } from './media.dto';

export class ListMediaPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ListMediaDTO>({
      limit: Joi.number().default(10).optional(),
      search: Joi.string().default('').optional(),
      page: Joi.number().default(0).optional(),
      status: Joi.number().default(-1).optional(),
      startDate: Joi.date().iso().default('').optional(),
      endDate: Joi.date().iso().default('').optional()
    });
  }
}

export class ApproveMediaPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ApproveMediaDTO>({
      mediaId: Joi.string().uuid().required(),
      status: Joi.number().equal(1, 2).required(),
      reasonId: Joi.when('status', {
        is: 2,
        then: Joi.number().greater(0).required(),
        otherwise: Joi.allow(0).optional()
      })
    });
  }
}

export class ApproveNewsPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ApproveNewsDTO>({
      newsId: Joi.string().uuid().required(),
      status: Joi.number().equal(1, 2).required(),
      reasonId: Joi.when('status', {
        is: 2,
        then: Joi.number().greater(0).required(),
        otherwise: Joi.allow(0).optional()
      })
    });
  }
}
