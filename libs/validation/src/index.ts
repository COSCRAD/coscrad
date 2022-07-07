import buildSimpleValidationFunction from './lib/buildSimpleValidationFunction';
import DiscriminatedUnionValidator from './lib/DiscriminatedUnionValidator';

export {
    ArrayNotEmpty as IsNonEmptyArray,
    /**
     * **Warning**: This uses `===` and will compare references not values for reference types.
     */
    Equals as IsStrictlyEqualTo,
    isEnum,
    IsEnum,
    IsInt,
    IsISBN,
    IsNotEmptyObject as IsNonEmptyObject,
    IsNumber,
    IsOptional,
    IsPositive,
    IsUrl,
    isUUID,
    IsUUID,
    ValidateNested,
} from 'class-validator';
export * from './lib/decorators';
export * from './lib/interfaces';
export { buildSimpleValidationFunction, DiscriminatedUnionValidator };
