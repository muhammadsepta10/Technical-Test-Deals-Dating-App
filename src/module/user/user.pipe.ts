import * as Joi from 'joi';
import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import { CreateUserDTO, RegisterDTO } from './user.dto';

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

export const registerSchema = Joi.object<RegisterDTO>({
  accessId: Joi.number().required(),
  appId: Joi.number().required(),
  createdById: Joi.number().allow(0, null).optional(),
  name: Joi.string().trim().required(),
  password: Joi.string().required(),
  type: Joi.number().valid(1, 2).required(),
  username: Joi.string().trim().pattern(/^\S+$/).uppercase().required()
});

export class RegisterPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return registerSchema;
  }
}
