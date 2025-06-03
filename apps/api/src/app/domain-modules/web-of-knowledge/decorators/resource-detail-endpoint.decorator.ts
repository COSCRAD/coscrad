import { Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { Ctor } from '../../../../lib/types/Ctor';

export interface ResourceIndexEndpointOptions {
    ViewModelType: Ctor<unknown>;
}

export function ResourceDetailEndpoint({
    ViewModelType,
}: ResourceIndexEndpointOptions): MethodDecorator {
    return function (
        target: object,
        propertyKey: string,
        typedPropertyDescriptor: TypedPropertyDescriptor<unknown>
    ) {
        /**
         * Here we wrap several other decorators that should be consistent
         * across all resource types.
         */
        ApiBearerAuth('JWT')(target as Ctor<unknown>, propertyKey, typedPropertyDescriptor);
        UseGuards(OptionalJwtAuthGuard)(
            target as Ctor<unknown>,
            propertyKey,
            typedPropertyDescriptor
        );
        ApiParam({
            name: 'id',
            required: true,
            example: '2',
        })(target as Ctor<unknown>, propertyKey, typedPropertyDescriptor);
        ApiOkResponse({ type: ViewModelType })(
            target as Ctor<unknown>,
            propertyKey,
            typedPropertyDescriptor
        );
        Get(`/:id`)(target as Ctor<unknown>, propertyKey, typedPropertyDescriptor);
    };
}
