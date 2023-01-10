import { isString, isURL as isStringAValidUrl } from 'class-validator';

// Here we adapt to our own constraint function API
export const isURL = (input: unknown) => isString(input) && isStringAValidUrl(input);
