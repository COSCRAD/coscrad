import { Term } from '../../../domain/models/term/entities/term.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { VocabularyListVariable } from '../../../domain/models/vocabulary-list/types/vocabulary-list-variable';
import { VocabularyListVariableValue } from '../../../domain/models/vocabulary-list/types/vocabulary-list-variable-value';
import { EntityId } from '../../../domain/types/entity-id';
import { NotFound } from '../../../lib/types/not-found';
import { TermViewModel } from './TermViewModel';

type VocabularyListEntryViewModel = {
  term: TermViewModel;

  variableValues: Record<string, VocabularyListVariableValue>;
};

export class VocabularyListViewModel {
  readonly name?: string;

  readonly nameEnglish?: string;

  readonly id: EntityId;

  readonly entries: VocabularyListEntryViewModel[];

  readonly variables: VocabularyListVariable[];

  constructor(vocabularyList: VocabularyList, allTerms: Term[]) {
    const { entries, id, name, variables } = vocabularyList;

    this.id = id;

    this.name = name;

    this.nameEnglish = this.nameEnglish;

    this.variables = [...variables];

    const newEntries = (entries || [])
      .map(({ termId, variableValues }) => ({
        term: allTerms.find((term) => term.id === termId) || NotFound,
        variableValues,
      }))
      .filter(
        ({ term }) => term !== NotFound
      ) as unknown as VocabularyListEntryViewModel[];

    this.entries = newEntries;
  }
}
