import isStringAValidUrl from 'validator/es/lib/isURL';
import { isString } from './is-string';

// Here we adapt to our own constraint function API
export const isURL = (input: unknown) => isString(input) && isStringAValidUrl(input);
