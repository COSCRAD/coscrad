import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { CallHandler, ExecutionContext, Inject, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { deepStandardizeMultilingualText } from '../../../domain/common/entities/deep-standardize-multilingual-text';
import { ITextStandardizerProvider } from '../../../domain/common/entities/multilingual-text';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError } from '../../../lib/errors/InternalError';
import { TOKENIZER_PROVIDER_INJECTION_TOKEN } from '../../../lib/nlp';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { CoscradInternalException, CoscradNotFoundException } from './CoscradExceptions';

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

const removePrivateProperties = (entity: any) => {
    if (!isNonEmptyObject(entity)) {
        return entity;
    }

    if ('accessControlList' in entity) {
        delete entity.accessControlList;
    }

    return entity;
};

export class ResourceQueryResponseTransformInterceptor<T> implements NestInterceptor<T, T> {
    constructor(
        @Inject(TOKENIZER_PROVIDER_INJECTION_TOKEN)
        private readonly textStandardizerProvider: ITextStandardizerProvider
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
        return next.handle().pipe(
            map((result) => {
                // How can we ensure that view models implement `HasEntities` \ 'HasForUser'?
                if (hasEntities(result)) {
                    result.entities = result.entities.flatMap((entity) => {
                        const forUser = entity.forUser(context.switchToHttp().getRequest()?.user);

                        const withoutPrivateProps = removePrivateProperties(forUser);

                        return isNotFound(forUser)
                            ? []
                            : [
                                  deepStandardizeMultilingualText(
                                      this.textStandardizerProvider,
                                      withoutPrivateProps
                                  ),
                              ];
                    });

                    return result;
                }

                // We know we do not have an array at this point
                return this.transformDetailResponse(context, result);
            })
        );
    }

    private transformDetailResponse(context: ExecutionContext, result: unknown) {
        if (!hasForUser(result)) {
            throw new CoscradInternalException(
                new InternalError(
                    `Encountered a resource query response without user permissions info`
                )
            );
        }

        const forUser = result.forUser(context.switchToHttp().getRequest()?.user);

        if (isNotFound(forUser)) {
            throw new CoscradNotFoundException();
        }

        // TODO remove private props
        const withoutPrivateProps = removePrivateProperties(forUser);

        /**
         * TODO We may want to do this using the event consumers intead for
         * performance.
         */
        return deepStandardizeMultilingualText(this.textStandardizerProvider, withoutPrivateProps);
    }
}
