import buildSimpleValidator from './lib/buildSimpleValidationFunction';
import DiscriminatedUnionValidator from './lib/DiscriminatedUnionValidator';

export {
    ArrayNotEmpty as IsNonEmptyArray,
    IsEnum,
    IsInt,
    IsISBN,
    IsNumber,
    IsOptional,
    IsPositive,
    IsUrl,
    ValidateNested,
} from 'class-validator';
export * from './lib/decorators';
export * from './lib/interfaces';
export { buildSimpleValidator, DiscriminatedUnionValidator };
