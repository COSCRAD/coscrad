import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../../types/entityType';
import { Entity } from '../../entity';
import { VocabularyListVariable } from '../types/vocabulary-list-variable';
import { VocabularyListEntry } from '../vocabulary-list-entry';

export class VocabularyList extends Entity {
  readonly type = entityTypes.vocabularyList;

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
