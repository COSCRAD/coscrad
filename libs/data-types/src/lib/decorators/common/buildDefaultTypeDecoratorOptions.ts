import { TypeDecoratorOptions } from '../types/TypeDecoratorOptions';

export default (): Omit<Required<TypeDecoratorOptions>, 'label' | 'description'> => ({
    isOptional: false,
    isArray: false,
});
