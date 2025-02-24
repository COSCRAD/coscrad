import { isNullOrUndefined } from '@coscrad/validation-constraints';
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

export const getCoscradDataExamples = <T = unknown>(target: Ctor<T>): DTO<T>[] => {
    const testMetadata = Reflect.getMetadata('SAMPLE', target);

    if (isNullOrUndefined(testMetadata)) return [];

    return testMetadata;
};

export const buildTestInstance = <T = unknown>(
    target: Ctor<T>,
    overrides: Partial<DTO<T>> = {}
): T => {
    const testMetadata = getCoscradDataExamples(target);

    if (!Array.isArray(testMetadata) || testMetadata.length === 0) {
        throw new InternalError(`No test data has been registered for: ${target}`);
    }

    if (!isFromDto(target)) {
        throw new InternalError(
            `In order to build a test instance of: ${
                Object.getPrototypeOf(target).name
            }, it must have a static factory method called "toDto"`
        );
    }

    // @ts-expect-error TODO fix the type issue with this utility
    return target.fromDto(clonePlainObjectWithOverrides<DTO<T>>(testMetadata[0], overrides)) as T;
};

/**
 * TODO If we like this approach, let's move code from here into a test util.
 * Also note that this has implications for our approach to generating standard
 * `OpenApi` schemas, including samples.
 */
export const CoscradDataExample = ({ example }: { example: Object }): ClassDecorator => {
    return function (target: any) {
        const existingTestData = getCoscradDataExamples(target);

        existingTestData.push(example);

        // here we overwrite the original
        Reflect.defineMetadata('SAMPLE', existingTestData, target);
    };
};
