import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import {
    CoscradInternalException,
    CoscradInvalidUserInputException,
    CoscradNotFoundException,
} from './CoscradExceptions';

interface ForUser {
    forUser(user?: CoscradUserWithGroups): Maybe<unknown>;
}

const hasForUser = (input: unknown): input is ForUser =>
    typeof (input as ForUser)?.forUser === 'function';

interface HasEntities {
    entities: ForUser[];
}

const hasEntities = (input: unknown): input is HasEntities => {
    const test = input as HasEntities;

    if (!Array.isArray(test?.entities)) {
        return false;
    }

    if (test.entities.length === 0) {
        // nothing to do here
        return false;
    }

    const itemToTest = test.entities[0];

    return hasForUser(itemToTest);
};

export class QueryResponseTransformInterceptor<T> implements NestInterceptor<T, T> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
        return next.handle().pipe(
            map((result) => {
                if (isNotFound(result)) {
                    throw new CoscradNotFoundException();
                }

                /**
                 * This will need to be updated to support
                 * - users passing query params for filtering in queries
                 * - command type errors?
                 */
                if (result instanceof InternalError) {
                    if (result instanceof CommandExecutionError) {
                        throw new CoscradInvalidUserInputException(result);
                    }

                    // Realistically, this should not happen. We throw internal errors.
                    throw new CoscradInternalException(result);
                }

                // How can we ensure that view models implement `HasEntities` \ 'HasForUser'?
                if (hasEntities(result)) {
                    result.entities = result.entities.flatMap((entity) => {
                        const forUser = entity.forUser(
                            context.switchToHttp().getRequest()?.user
                        ) as any;

                        if (isNotFound(forUser)) {
                            return [];
                        }

                        return [forUser];
                    });
                }

                // We know we do not have an array at this point
                if (!hasForUser(result)) {
                    // TODO handle array responses
                    return result;
                }

                const forUser = result.forUser(context.switchToHttp().getRequest()?.user);

                if (isNotFound(forUser)) {
                    throw new CoscradNotFoundException();
                }

                // TODO remove private props
                return forUser;
            })
        );
    }
}
