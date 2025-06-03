import { Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { Ctor } from '../../../../lib/types/Ctor';

export interface ResourceIndexEndpointOptions {
    ViewModelType: Ctor<unknown>;
}

export function ResourceIndexEndpoint({
    ViewModelType: _,
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

        // TODO We need a wrapper class for `IIndexQueryRepsonse`
        // ApiOkResponse({ type: viewModelType })(
        //     target as Ctor<unknown>,
        //     propertyKey,
        //     typedPropertyDescriptor
        // );
        Get(``)(target as Ctor<unknown>, propertyKey, typedPropertyDescriptor);
    };
}
