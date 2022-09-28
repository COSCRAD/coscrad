import { validateSocialMediaLink } from './validateSocialMediaLink';

export const validateSocialMediaLinks = (input: unknown): Error[] => {
    if (input === null) return [new Error(`social media links is null`)];

    if (input === undefined) return [new Error(`property: social media links is undefined`)];

    if (!Array.isArray(input)) return [new Error(`property: social media links is a number`)];

    return (input as Error[]).flatMap(validateSocialMediaLink);
};
