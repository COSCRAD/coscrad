import { ComplexCoscradDataType } from '../types';
import { BibliographicSubjectCreatorType } from './BibliographicSubjectCreatorType';
import { CoscradEnum } from './CoscradEnum';
import { CoscradUserRole } from './CoscradUserRole';
import { EdgeConnectionMemberRole } from './EdgeConnectionMemberRole';
import { MIMEType } from './MIMEType';
import { EnumMetadata } from './types/EnumMetadata';

const complexDataType = ComplexCoscradDataType.enum;

const enumNameToMetadata: { [K in CoscradEnum]: EnumMetadata } = {
    [CoscradEnum.MIMEType]: {
        complexDataType: complexDataType,
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
        complexDataType: complexDataType,
        enumName: CoscradEnum.CoscradUserRole,
        enumLabel: 'User Role',
        labelsAndValues: [
            {
                label: 'admin',
                value: CoscradUserRole.projectAdmin,
            },
            {
                label: 'viewer',
                value: CoscradUserRole.viewer,
            },
            {
                label: 'COSCRAD admin',
                value: CoscradUserRole.superAdmin,
            },
        ],
    },
    [CoscradEnum.BibliographicSubjectCreatorType]: {
        complexDataType: complexDataType,
        enumName: CoscradEnum.BibliographicSubjectCreatorType,
        enumLabel: 'Creator Type',
        labelsAndValues: [
            {
                label: 'artist',
                value: BibliographicSubjectCreatorType.artist,
            },
            {
                label: 'author',
                value: BibliographicSubjectCreatorType.author,
            },
            {
                label: 'director',
                value: BibliographicSubjectCreatorType.director,
            },
        ],
    },
    [CoscradEnum.EdgeConnectionMemberRole]: {
        complexDataType: complexDataType,
        enumName: CoscradEnum.EdgeConnectionMemberRole,
        enumLabel: 'Edge Connection Member Role',
        labelsAndValues: [
            {
                label: 'from',
                value: EdgeConnectionMemberRole.from,
            },
            {
                label: 'to',
                value: EdgeConnectionMemberRole.to,
            },
            {
                label: 'self',
                value: EdgeConnectionMemberRole.self,
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
