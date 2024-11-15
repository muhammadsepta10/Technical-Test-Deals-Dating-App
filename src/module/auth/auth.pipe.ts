import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import * as Joi from 'joi';
import { DeviceDto, LoginDTO, RegisterDTO, ReqOtpDTO, ValidateOtpDTO } from './auth.dto';

export class LoginPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<LoginDTO>({
      username: Joi.string().trim().lowercase().required(),
      media: Joi.string().optional().default('500'),
      password: Joi.string().trim().required(),
      version: Joi.string().optional().default('1.0').allow(''),
      device: Joi.object<DeviceDto>({
        imei: Joi.string().trim().optional().messages({
          'any.required': `imei is a required field`
        }),
        devicetype: Joi.string().optional().trim().allow(''),
        language: Joi.string().optional().trim().allow(''),
        manufacturer: Joi.string().optional().trim().allow(''),
        model: Joi.string().optional().trim().allow(''),
        os: Joi.string().optional().trim().allow(''),
        osVersion: Joi.string().optional().trim().allow(''),
        region: Joi.string().optional().trim().allow(''),
        sdkVersion: Joi.string().optional().trim().allow(''),
        heightdips: Joi.number().optional().allow(''),
        heightpixels: Joi.number().optional().allow(''),
        scale: Joi.number().optional().allow(''),
        widthdips: Joi.number().optional().allow(''),
        widthpixels: Joi.number().optional().allow(''),
        player_id: Joi.string().optional().trim().allow(''),
        firebase_id: Joi.string().optional().trim().allow('')
      })
    });
  }
}

export class ReqOtpPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ReqOtpDTO>({
      email: Joi.string().email().lowercase().trim().required()
    });
  }
}
export class ValidateOtpPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<ValidateOtpDTO>({
      email: Joi.string().email().lowercase().trim().required(),
      otp: Joi.number().required()
    });
  }
}

export class RegisterPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<RegisterDTO>({
      username: Joi.string().lowercase().trim().required(),
      email: Joi.string().email().lowercase().trim().required(),
      name: Joi.string().trim().lowercase().required(),
      password: Joi.string().min(8).required(),
      photo: Joi.string().base64().required(),
      device: Joi.object<DeviceDto>({
        imei: Joi.string().trim().optional().messages({
          'any.required': `imei is a required field`
        }),
        devicetype: Joi.string().optional().trim().allow(''),
        language: Joi.string().optional().trim().allow(''),
        manufacturer: Joi.string().optional().trim().allow(''),
        model: Joi.string().optional().trim().allow(''),
        os: Joi.string().optional().trim().allow(''),
        osVersion: Joi.string().optional().trim().allow(''),
        region: Joi.string().optional().trim().allow(''),
        sdkVersion: Joi.string().optional().trim().allow(''),
        heightdips: Joi.number().optional().allow(''),
        heightpixels: Joi.number().optional().allow(''),
        scale: Joi.number().optional().allow(''),
        widthdips: Joi.number().optional().allow(''),
        widthpixels: Joi.number().optional().allow(''),
        player_id: Joi.string().optional().trim().allow(''),
        firebase_id: Joi.string().optional().trim().allow('')
      })
    });
  }
}
