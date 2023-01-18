import buildSimpleValidationFunction from './lib/buildSimpleValidationFunction';
import DiscriminatedUnionValidator from './lib/DiscriminatedUnionValidator';

export {
    ArrayNotEmpty as IsNonEmptyArray,
    Equals,
    /**
     * **Warning**: This uses `===` and will compare references not values for reference types.
     */
    Equals as IsStrictlyEqualTo,
    isEnum,
    IsEnum,
    IsInt,
    isISBN,
    IsISBN,
    IsNotEmptyObject as IsNonEmptyObject,
    isNotEmptyObject as isNonEmptyObject,
    IsNumber,
    IsOptional,
    IsPositive,
    IsUrl,
    isUUID,
    IsUUID,
    ValidateNested,
} from 'validator';
export * from './lib/interfaces';
export { buildSimpleValidationFunction, DiscriminatedUnionValidator };
