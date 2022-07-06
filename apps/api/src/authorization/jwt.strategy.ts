import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InternalError } from '../lib/errors/InternalError';

type HasSub = { sub: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
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

    validate(payload: unknown): unknown {
        const userId = (payload as HasSub)?.sub;

        if (!userId) {
            throw new InternalError(`Invalid user payload received from auth0: ${payload}`);
        }

        return { id: userId };
    }
}
