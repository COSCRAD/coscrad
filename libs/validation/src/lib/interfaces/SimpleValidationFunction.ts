import { ValidationError } from 'class-validator';

export interface SimpleValidationFunction {
    (input: unknown): ValidationError[];
}
