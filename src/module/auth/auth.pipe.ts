import { JoiValidationPipe } from '@common/pipes/joi-validation.pipe';
import * as Joi from 'joi';
import { DeviceDto, LoginDTO, RegisterDTO, ReqOtpDTO, ValidateOtpDTO } from './auth.dto';

export class LoginPipe extends JoiValidationPipe {
  public buildSchema(): Joi.Schema {
    return Joi.object<LoginDTO>({
      username: Joi.string().trim().lowercase().required(),
      media: Joi.string().optional().default('400'),
      password: Joi.string().trim().required(),
      version: Joi.number().optional().allow(''),
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
      media_name: Joi.string().trim().required(),
      whatsapp_no: Joi.string().trim().required(),
      email: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      bankId: Joi.number().required(),
      account_no: Joi.number().required(),
      pers_card_no: Joi.string().trim().required(),
      npwp: Joi.string().trim().required().min(15).max(17),
      instagram_link: Joi.string().trim(),
      facebook_link: Joi.string().trim(),
      x_link: Joi.string().trim(),
      tiktok_link: Joi.string().trim(),
      youtube_link: Joi.string().trim(),
      website_link: Joi.string().trim(),
      podcast_link: Joi.string().trim()
    });
  }
}
