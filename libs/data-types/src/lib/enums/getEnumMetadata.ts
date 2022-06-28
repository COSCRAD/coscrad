import CoscradDataType from '../types/CoscradDataType';
import { CoscradEnum } from './CoscradEnum';
import { MIMEType } from './MIMEType';
import { EnumMetadata } from './types/EnumMetadata';

const enumNameToMetadata: Record<string, EnumMetadata> = {
    [CoscradEnum.MIMEType]: {
        type: CoscradDataType.Enum,
        enumName: CoscradEnum.MIMEType,
        enumLabel: 'MIME Type',
        labelsAndValues: [
            {
                label: 'mp3',
                value: MIMEType.mp3,
            },
            {
                label: 'mp4',
                value: MIMEType.mp4,
            },
        ],
    },
};

export default (enumName: CoscradEnum): EnumMetadata => {
    const searchResult = enumNameToMetadata[enumName];

    if (!searchResult) {
        throw new Error(`No metadata is registered for the enum: ${enumName}`);
    }

    return searchResult;
};
