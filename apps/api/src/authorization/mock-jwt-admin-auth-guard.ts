import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';

export class MockJwtAdminAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly testUserWithGroups: CoscradUserWithGroups | undefined) {
        super();
    }

    override handleRequest<TUser = CoscradUserWithGroups>() {
        if (!this.testUserWithGroups) {
            throw new UnauthorizedException();
        }

        return this.testUserWithGroups as unknown as TUser;
    }

    override async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if (this.testUserWithGroups) request.user = this.testUserWithGroups;

        if (!this.testUserWithGroups || !this.testUserWithGroups.isAdmin())
            return Promise.resolve(false);

        return Promise.resolve(true);
    }
}
