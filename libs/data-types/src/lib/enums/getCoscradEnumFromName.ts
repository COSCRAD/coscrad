import { BibliographicSubjectCreatorType } from './BibliographicSubjectCreatorType';
import { CoscradEnum } from './CoscradEnum';
import { CoscradUserRole } from './CoscradUserRole';
import { EdgeConnectionMemberRole } from './EdgeConnectionMemberRole';

const lookupTable: { [K in CoscradEnum]: Record<string, string> } = {
    [CoscradEnum.CoscradUserRole]: CoscradUserRole,
    [CoscradEnum.BibliographicSubjectCreatorType]: BibliographicSubjectCreatorType,
    [CoscradEnum.EdgeConnectionMemberRole]: EdgeConnectionMemberRole,
};

export default (enumName: CoscradEnum): Record<string, string> => {
    const searchResult = lookupTable[enumName];

    if (!searchResult) {
        throw new Error(`Failed to find a COSCRAD enum data type with the name: ${enumName}`);
    }

    return searchResult;
};
