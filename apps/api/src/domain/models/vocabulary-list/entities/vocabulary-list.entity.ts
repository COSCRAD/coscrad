import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../../types/resourceTypes';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { Resource } from '../../resource.entity';
import { VocabularyListEntry } from '../vocabulary-list-entry';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

export class VocabularyList extends Resource {
    readonly type = resourceTypes.vocabularyList;

    readonly allowedContextTypes = [EdgeConnectionContextType.general];

    readonly name?: string;

    readonly nameEnglish?: string;

    readonly entries: VocabularyListEntry[];

    readonly variables: VocabularyListVariable[];

    constructor(dto: PartialDTO<VocabularyList>) {
        super(dto);

        const { name, nameEnglish, entries, variables } = dto;

        this.name = name;

        this.nameEnglish = nameEnglish;

        // TODO type guard for this (validation already complete at this point)
        this.entries = [...(entries as VocabularyListEntry[])];

        this.variables = [...(variables as VocabularyListVariable[])];
    }
}
