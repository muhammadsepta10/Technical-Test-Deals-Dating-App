import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import * as Joi from 'joi';
import { ListReasonDTO } from './master.dto';

export class ListReasonPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ListReasonDTO>({
      type: Joi.number().optional().default(0)
    });
  }
}
