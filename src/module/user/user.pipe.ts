import * as Joi from 'joi';
import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import { CreateUserDTO } from './user.dto';

// export class UpdatePassPipe extends JoiValidationPipe {
// public buildSchema(): Joi.Schema {
// return Joi.object<UpdatePasswordDTO>({
//     password: Joi.string().trim().min(8).required()
// })
// }
// }

export class CreateUserPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<CreateUserDTO>({
      accessId: Joi.number().required(),
      appId: Joi.number().required(),
      name: Joi.string().min(3).required().trim(),
      username: Joi.string().min(3).lowercase().required(),
      password: Joi.string().trim().min(8).required()
    });
  }
}
