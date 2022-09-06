import AppInfo from './AppInfo';
import rawData from './apps.config.json';
import validateAppInfo, { isErrorArray } from './validation/validateAppInfo';

export default (): AppInfo[] | Error => {
    if (!Array.isArray(rawData))
        return new Error(`Invalid app info config: expected array, received: ${rawData}`);

    const validationErrors = rawData.reduce((allErrors, item) => {
        const validationResult = validateAppInfo(item);

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

    return rawData as AppInfo[];
};
