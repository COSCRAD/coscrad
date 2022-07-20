import { AuthGuard } from '@nestjs/passport';
import { InternalError } from '../lib/errors/InternalError';

/**
 * This route guard should be used wherever the public is allowed to access an endpoint,
 * but we would optionally like to enhance the behaviour for an authenticated user.
 * For example, in resource queries, the public can access all `published`
 * resources, but an authenticated user can additionally access any resource they
 * are authorized to read based on RBAC and/or the resource's `queryAccessControlList`.
 */
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest so no error is thrown for un-authenticated users
    override handleRequest(err, user, __, ___) {
        if (err) {
            throw new InternalError(`Optional Auth Guard encountered an unexpected error`, [err]);
        }

        return user;
    }
}
