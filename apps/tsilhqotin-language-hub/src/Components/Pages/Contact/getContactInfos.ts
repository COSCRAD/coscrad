import rawData from './contactData/contact.config.json';
import ContactInfo from './contactData/ContactInfo';
import validateContactInfo, { isErrorArray } from './validation/validateContactInfo';

export default (): ContactInfo[] | Error => {
    if (!Array.isArray(rawData))
        return new Error(`Invalid app info config: expected array, received: ${rawData}`);

    const validationErrors = rawData.reduce((allErrors, item) => {
        const validationResult = validateContactInfo(item);

        if (isErrorArray(validationResult)) return allErrors.concat(validationResult);

        return allErrors;
    }, []);

    if (validationErrors.length > 0) {
        const msg = validationErrors.reduce(
            (acc, nextError) => acc + `\n${nextError.message}`,
            `Invalid app info config encountered. Errors: `
        );

        return new Error(msg);
    }

    return rawData as ContactInfo[];
};
