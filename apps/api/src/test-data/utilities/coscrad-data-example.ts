import 'reflect-metadata';
// //////////////////////////////////// The above is a polyfill for the `Reflect` api and must come first
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { plainToClass } from 'class-transformer';
import { InternalError } from '../../lib/errors/InternalError';
import { Ctor } from '../../lib/types/Ctor';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';

interface FromDto<T = unknown> {
    fromDto(dto: DTO<T>): T;
}

const isFromDto = <T = unknown>(input: unknown): input is FromDto<T> =>
    !isNullOrUndefined(input) && typeof (input as FromDto).fromDto === 'function';

export const getCoscradDataExamples = <T = unknown>(target: Ctor<T>): DTO<T>[] => {
    if (typeof target === 'undefined') {
        throw new Error(
            `Failed to manage data examples due to missing class reference. Expected a class constructor, received undefined. Do you have a circular build dependency?`
        );
    }

    const testMetadata = Reflect.getMetadata('SAMPLE', target);

    if (isNullOrUndefined(testMetadata)) return [];

    return testMetadata;
};

export const buildTestInstance = <T = unknown>(
    target: Ctor<T>,
    overrides: DeepPartial<DTO<T>> = {} as DeepPartial<DTO<T>>
): T => {
    const testMetadata = getCoscradDataExamples(target);

    if (!Array.isArray(testMetadata) || testMetadata.length === 0) {
        throw new InternalError(`No test data has been registered for: ${target}`);
    }

    // @ts-expect-error TODO fix the type issue with this utility
    const dto = clonePlainObjectWithOverrides<DTO<T>>(testMetadata[0], overrides);

    if (!isFromDto(target)) {
        // TODO check if it has an empty constructor?
        const instance = plainToClass(target, dto);

        return instance;

        // throw new InternalError(
        //     `In order to build a test instance of: ${
        //         Object.getPrototypeOf(target).name
        //     }, it must have a static factory method called "fromDto"`
        // );
    }

    return target.fromDto(dto) as T;
};

interface CoscradDataExampleOptions<T = unknown> {
    example: DTO<T>;
}

/**
 * TODO If we like this approach, let's move code from here into a test util.
 * Also note that this has implications for our approach to generating standard
 * `OpenApi` schemas, including samples.
 */
export function CoscradDataExample<T>({ example }: CoscradDataExampleOptions<T>): ClassDecorator {
    // @ts-expect-error treat this as a cast. What's important is type-safety at the call site.
    return function (target: Ctor<T>) {
        const existingTestData = getCoscradDataExamples(target);

        existingTestData.push(example);

        // here we overwrite the original
        Reflect.defineMetadata('SAMPLE', existingTestData, target);
    };
}
