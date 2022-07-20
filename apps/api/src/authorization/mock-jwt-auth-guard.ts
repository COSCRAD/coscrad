import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';

export class MockJwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private readonly testUserWithGroups: CoscradUserWithGroups | undefined,
        private readonly isAuthOptional: boolean
    ) {
        super();
    }

    override handleRequest<TUser = unknown>() {
        if (!this.testUserWithGroups) {
            if (this.isAuthOptional) return undefined;

            throw new UnauthorizedException();
        }

        return this.testUserWithGroups as unknown as TUser;
    }

    override async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if (this.testUserWithGroups) request.user = this.testUserWithGroups;

        return Promise.resolve(true);
    }
}
