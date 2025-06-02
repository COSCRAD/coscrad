import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RESOURCES_ROUTE_PREFIX } from '../../../controllers/resources/constants';
import { QueryResponseTransformInterceptor } from '../../../controllers/response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../../../controllers/response-mapping/CoscradExceptions/exception-filters';

const pluralizeResourceTypeInCamelCase = (resourceType: string): string => `${resourceType}s`;

export interface ResourceControllerOptions {
    resourceType: string;
    baseRouteOverride?: string;
}

export function ResourceController({
    resourceType,
    baseRouteOverride,
}: ResourceControllerOptions): ClassDecorator {
    const resourceRelativePath = isNullOrUndefined(baseRouteOverride)
        ? pluralizeResourceTypeInCamelCase(resourceType)
        : baseRouteOverride;

    const path = `${RESOURCES_ROUTE_PREFIX}/${resourceRelativePath}`;

    return function (target: object) {
        // @ts-expect-error we will only use this decorator on controller classes and tests will fail if we miss the annotation
        Controller(path)(target);

        // @ts-expect-error we will only use this decorator on controller classes and tests will fail if we miss the annotation

        ApiTags(RESOURCES_ROUTE_PREFIX)(target);

        UseFilters(
            new CoscradNotFoundFilter(),
            new CoscradInvalidUserInputFilter(),
            new CoscradInternalErrorFilter()
            // @ts-expect-error we will only use this decorator on controller classes and tests will fail if we miss the annotation
        )(target);

        // @ts-expect-error we will only use this decorator on controller classes and tests will fail if we miss the annotation
        UseInterceptors(QueryResponseTransformInterceptor)(target);
    };
}
