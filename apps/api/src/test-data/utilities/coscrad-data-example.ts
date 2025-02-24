import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import 'reflect-metadata';
import { InternalError } from '../../lib/errors/InternalError';
import { Ctor } from '../../lib/types/Ctor';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { DTO } from '../../types/DTO';

interface FromDto<T = unknown> {
    fromDto(dto: DTO<T>): T;
}

const isFromDto = <T = unknown>(input: unknown): input is FromDto<T> =>
    !isNullOrUndefined(input) && typeof (input as FromDto).fromDto === 'function';

export const buildTestInstance = <T = unknown>(
    Ctor: Ctor<T>,
    overrides: Record<string, unknown>
): T => {
    const testMetadata = Reflect.getMetadata('SAMPLE', Ctor);

    if (!isNonEmptyObject(testMetadata)) {
        throw new InternalError(`No metadata found for: ${Ctor}`);
    }

    if (!isFromDto(Ctor)) {
        throw new InternalError(
            `In order to build a test instance of: ${
                Object.getPrototypeOf(Ctor).name
            }, it must have a static factory method called "toDto"`
        );
    }

    return Ctor.fromDto(clonePlainObjectWithOverrides(testMetadata, overrides)) as T;
};

/**
 * TODO If we like this approach, let's move code from here into a test util.
 * Also note that this has implications for our approach to generating standard
 * `OpenApi` schemas, including samples.
 */
export const CoscradDataExample = ({ example }: { example: Object }): ClassDecorator => {
    return function (target: Object) {
        Reflect.defineMetadata('SAMPLE', example, target);
    };
};
