import { isStringWithNonzeroLength } from '@coscrad/validation';
import FrontMatter from '../frontMatterData/FrontMatter';

export const isErrorArray = (input: unknown): input is Error[] =>
    Array.isArray(input) && input.every((item) => item instanceof Error);

export default (input: unknown): FrontMatter | Error[] => {
    const { siteTitle, subTitle, about, siteDescription, copyrightHolder } = input as FrontMatter;

    const allErrors: Error[] = [];

    if (!isStringWithNonzeroLength(siteTitle))
        allErrors.push(new Error(`Front Matter: siteTitle must be a string. Received: ${siteTitle}`));

    if (!isStringWithNonzeroLength(subTitle))
        allErrors.push(new Error(`Front Matter: subTitle must be a string. Received: ${subTitle}`));

    if (!isStringWithNonzeroLength(about))
        allErrors.push(new Error(`Front Matter: about must be a string. Received: ${about}`));

    if (!isStringWithNonzeroLength(siteDescription))
        allErrors.push(
            new Error(
                `Front Matter: siteDescription must be a non empty string. Received: ${siteDescription}`
            )
        );

    if (!isStringWithNonzeroLength(copyrightHolder))
        allErrors.push(
            new Error(
                `Front Matter: copyrightHolder must be a non empty string. Received: ${copyrightHolder}`
            )
        );

    if (allErrors.length > 0) return allErrors;

    return input as FrontMatter;
};