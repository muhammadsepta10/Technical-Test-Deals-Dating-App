import * as appRoot from 'app-root-path';
import * as dayjs from 'dayjs';
import { diskStorage } from 'multer';
import { CommonService } from '@common/service/common.service';
import { AppConfigService } from '../api/config.service';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const configService = new ConfigService();
const appConfigService = new AppConfigService(configService);
const commonService = new CommonService(appConfigService);

export const multerOptions = dest => {
  return {
    storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const dir = `${appRoot}/../public/${dest}/`;
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        cb(null, resolve(dir));
      },
      filename: async (req, file, cb) => {
        const uniqueName = await commonService.randString(10, '1234567890POIUYTREWQASDFGHJKLMNBVCXZ', '');
        const refId = `${dayjs().unix()}-${uniqueName}`;
        const ext = file.originalname.split('.').pop().toLowerCase();
        cb(null, `${refId}.${ext}`.replace(/\s/g, ''));
      }
    })
  };
};
