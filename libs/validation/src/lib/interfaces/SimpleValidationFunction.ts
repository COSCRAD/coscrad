import { SimpleValidationError } from './SimpleValidationError';

export interface SimpleValidationFunction {
    (input: unknown): SimpleValidationError[];
}
