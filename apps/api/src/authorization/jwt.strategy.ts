import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
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

        const userId = auth0UserId.split('|')?.[1] || null;

        if (!userId) {
            throw new InternalError(`Invalid user payload received from auth0: ${payload}`);
        }

        const userSearchResult = await this.repositoryProvider
            .getUserRepository()
            .fetchById(userId);

        if (isInternalError(userSearchResult)) {
            throw userSearchResult;
        }

        if (isNotFound(userSearchResult)) {
            throw new InternalError(`There is no user with the ID: ${userId}`);
        }

        return userSearchResult;
    }
}
