import CoscradDataType from '../types/CoscradDataType';
import { CoscradEnum } from './CoscradEnum';
import { CoscradUserRole } from './CoscradUserRole';
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
    [CoscradEnum.CoscradUserRole]: {
        type: CoscradDataType.Enum,
        enumName: CoscradEnum.CoscradUserRole,
        enumLabel: 'User Role',
        labelsAndValues: [
            {
                label: 'admin',
                value: CoscradUserRole.admin,
            },
            {
                label: 'viewer',
                value: CoscradUserRole.viewer,
            },
            {
                label: 'COSCRAD admin',
                value: CoscradUserRole.super,
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
