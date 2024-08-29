import * as Joi from 'joi';
import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import { ApproveMediaDTO, ApproveNewsDTO, ListMediaDTO, NewsItemsDTO } from './media.dto';

export class ListMediaPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ListMediaDTO>({
      limit: Joi.number().default(10).optional(),
      search: Joi.string().default('').optional(),
      page: Joi.number().default(0).optional(),
      status: Joi.number().default(-1).optional(),
      startDate: Joi.date().iso().default('').optional(),
      endDate: Joi.date().iso().default('').optional(),
      isInvoice: Joi.number().default(-1).optional()
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

export class GenerateInvoicePipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.array().items(
      Joi.object<NewsItemsDTO>({
        newsId: Joi.string().uuid().required(),
        price: Joi.number().min(1).required(),
        quantity: Joi.number().min(1)
      })
    );
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
