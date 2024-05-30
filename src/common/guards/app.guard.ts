import {CommonService} from '@common/service/common.service';
import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {MasterAppRepository} from 'src/db/project-db/entity/master-app/master-app.repository';

@Injectable()
export class AppGuard implements CanActivate {
    constructor(
        private commonService: CommonService
    ) { }

    @InjectRepository(MasterAppRepository) private masterAppRepository: MasterAppRepository

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest();
            const appAuth = req.headers?.["app-auth"]
            const appAuthDecrypted = Buffer.from(appAuth, "base64").toString("ascii").split(":")
            const username = appAuthDecrypted?.[0] || ""
            const password = appAuthDecrypted?.[1] || ""
            const validate = await this._validate(username, password)
            if (!validate) {
                return false
            }
            req.appId = validate
            return true
        } catch (error) {
            return false
        }
    }

    private async _validate(username: string, password: string) {
        username = username?.toLowerCase() || ""
        const masterApp = await this.masterAppRepository.findOne({where: {code: username}, select: ["id", "secret_key"]})
        if (!masterApp) {
            return null
        }
        const descryptedPass = await this.commonService.decrypt(masterApp.secret_key, "appSecret")
        if (descryptedPass !== password) {
            return null
        }
        return masterApp.id
    }
}