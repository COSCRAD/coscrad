import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { InternalError } from '../../../lib/errors/InternalError';
import { isNotFound } from '../../../lib/types/not-found';
import {
    CoscradInternalException,
    CoscradInvalidUserInputException,
    CoscradNotFoundException,
} from './CoscradExceptions';

export class QueryResponseTransformInterceptor<T> implements NestInterceptor<T, T> {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<T> {
        return next.handle().pipe(
            map((result) => {
                if (isNotFound(result)) {
                    throw new CoscradNotFoundException();
                }

                if (result instanceof InternalError) {
                    if (result instanceof CommandExecutionError) {
                        throw new CoscradInvalidUserInputException(result);
                    }

                    throw new CoscradInternalException(result);
                }

                return result;
            })
        );
    }
}
