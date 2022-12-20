import { TypeDecoratorOptions } from '../types/TypeDecoratorOptions';
import buildDefaultTypeDecoratorOptions from './buildDefaultTypeDecoratorOptions';

export default (userOptions: TypeDecoratorOptions): Required<TypeDecoratorOptions> => ({
    ...buildDefaultTypeDecoratorOptions(),
    ...userOptions,
});
