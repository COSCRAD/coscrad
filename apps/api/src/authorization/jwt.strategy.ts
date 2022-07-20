import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { validAggregateOrThrow } from '../domain/models/shared/functional';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { RepositoryProvider } from '../persistence/repositories/repository.provider';

/**
 * It is convention for the auth provider to populate the `sub` field on the
 * request body with the `userId`. Note that this has the format
 * '<PROVIDER>|RANDOM NUMBER', e.g. 'auth0|2929394844594949...'
 */
type HasSub = { sub: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly repositoryProvider: RepositoryProvider
    ) {
        const issuerURL = configService.get<string>('AUTH0_ISSUER_URL');
        if (!issuerURL) throw new Error('Internal Error: could not determine issuer url');

        const audience = configService.get<string>('AUTH0_AUDIENCE');
        if (!audience) throw new Error('Internal Error: could not determine audience');

        const jwksUri = `${issuerURL}.well-known/jwks.json`;

        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri,
            }),

            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience,
            issuer: issuerURL,
            algorithms: ['RS256'],
        });
    }

    async validate(payload: unknown): Promise<CoscradUser> {
        const auth0UserId = (payload as HasSub)?.sub;

        if (!auth0UserId) {
            throw new UnauthorizedException();
        }

        /**
         * Note that we search here by the authProvider assigned userId, which is
         * not our internal `aggregate ID` for the `CoscradUser`. This is so
         * we can remain in control of the latter.
         */
        const userSearchResult = await this.repositoryProvider
            .getUserRepository()
            .fetchByProviderId(auth0UserId);

        if (isInternalError(userSearchResult)) {
            throw new UnauthorizedException();
        }

        if (isNotFound(userSearchResult)) {
            throw new UnauthorizedException();
        }

        const allUserGroups = await this.repositoryProvider.getUserGroupRepository().fetchMany();

        const groupsForThisUser = allUserGroups
            .filter(validAggregateOrThrow)
            .filter(({ userIds }) => userIds.includes(userSearchResult.id));

        return new CoscradUserWithGroups(userSearchResult, groupsForThisUser);
    }
}
