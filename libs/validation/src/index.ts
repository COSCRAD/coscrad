import buildSimpleValidator from './lib/buildSimpleValidationFunction';
import DiscriminatedUnionValidator from './lib/DiscriminatedUnionValidator';

export {
    ArrayNotEmpty as IsNonEmptyArray,
    IsInt,
    IsISBN,
    IsNumber,
    IsOptional,
    IsPositive,
    IsUrl,
} from 'class-validator';
export * from './lib/decorators';
export * from './lib/interfaces';
export { buildSimpleValidator, DiscriminatedUnionValidator };
