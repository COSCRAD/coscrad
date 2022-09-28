import ContactInfo from '../contactData/ContactInfo';

// TODO Import this from the validation lib
const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

export const isErrorArray = (input: unknown): input is Error[] =>
    Array.isArray(input) && input.every((item) => item instanceof Error);

export default (input: unknown): ContactInfo | Error[] => {
    const { name, title, department } = input as ContactInfo;

    const allErrors: Error[] = [];

    if (!isStringWithNonzeroLength(name))
        allErrors.push(new Error(`Contact info: name must be a string. Received: ${name}`));

    if (!isStringWithNonzeroLength(title))
        allErrors.push(new Error(`Contact info: image must be a valid URL. Received: ${title}`));

    if (!isStringWithNonzeroLength(department))
        allErrors.push(
            new Error(
                `Contact info: description must be a non empty string. Received: ${department}`
            )
        );

    if (allErrors.length > 0) return allErrors;

    return input as ContactInfo;
};
