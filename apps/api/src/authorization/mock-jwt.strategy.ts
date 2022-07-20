import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Environment } from '../app/config/constants/Environment';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError } from '../lib/errors/InternalError';

export class MockJwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly testUserWithGroups?: CoscradUserWithGroups) {
        super({
            secretOrKey: 'S3krIt',
            jwtFromRequest: () => 'my key',
        });

        if (process.env.NODE_ENV !== Environment.test) {
            throw new InternalError(`The Mock JWT Strategy must only be used in tests!`);
        }
    }

    async validate() {
        return Promise.resolve(this.testUserWithGroups.clone() || undefined);
    }
}
