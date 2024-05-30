import {Roles} from "@common/decorators/role.decorator";
import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Observable} from "rxjs";
import {UserService} from "src/modules/user/user.service";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService
    ) { }
    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.get(Roles, context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.userId;
        const appId = request.appId;
        return this._matchRole(userId, roles, appId)
    }

    private async _matchRole(userId, roles: string[], appId) {
        let getRole = await this.userService.getRole(userId, appId)
        const code = getRole?.code || ""
        return roles.includes(code)
    }
}