import { TypeDecoratorOptions } from '../types/TypeDecoratorOptions';
import buildDefaultTypeDecoratorOptions from './buildDefaultTypeDecoratorOptions';

export default (userOptions: Partial<TypeDecoratorOptions>): TypeDecoratorOptions => ({
    ...buildDefaultTypeDecoratorOptions(),
    ...userOptions,
});
