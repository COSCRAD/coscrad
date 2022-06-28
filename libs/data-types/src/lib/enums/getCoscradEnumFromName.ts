import { CoscradEnum } from './CoscradEnum';
import { MIMEType } from './MIMEType';

const lookupTable: { [K in CoscradEnum]: Record<string, string> } = {
    [CoscradEnum.MIMEType]: MIMEType,
};

export default (enumName: CoscradEnum): Record<string, string> => {
    const searchResult = lookupTable[enumName];

    if (!searchResult) {
        throw new Error(`Failed to find a COSCRAD enum data type with the name: ${enumName}`);
    }

    return searchResult;
};
