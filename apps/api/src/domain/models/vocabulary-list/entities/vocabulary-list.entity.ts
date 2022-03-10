import isStringWithNonzeroLength from 'apps/api/src/lib/utilities/isStringWithNonzeroLength';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../../types/entityType';
import { determineAllMissingRequiredProperties } from '../../../utilities/validation/determine-all-missing-required-properties';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Entity } from '../../entity';
import { VocabularyListVariable } from '../types/vocabulary-list-variable';
import { VocabularyListEntry } from '../vocabulary-list-entry';

export class VocabularyList extends Entity {
  readonly type = entityTypes.vocabularyList;

  readonly name?: string;

  readonly nameEnglish?: string;

  readonly entries: VocabularyListEntry[];

  readonly variables: VocabularyListVariable[];

  constructor(dto: unknown) {
    super(dto);

    if (!this.#validate(dto)) {
      throw new Error(
        `Invalid dto for a vocabulary list: ${JSON.stringify(dto)}`
      );
    }

    const { name, nameEnglish, entries, variables } = dto;

    this.name = name;

    this.nameEnglish = nameEnglish;

    // TODO type guard for this (validation already complete at this point)
    this.entries = [...(entries as VocabularyListEntry[])];

    this.variables = [...(variables as VocabularyListVariable[])];
  }

  // TODO move this to the domain model validator instead
  #validate(dto: unknown): dto is PartialDTO<VocabularyList> {
    const test = dto as PartialDTO<VocabularyList>;

    if (isNullOrUndefined(test)) return false;

    const missingProperties = determineAllMissingRequiredProperties(test, [
      'id',
      'entries',
      'variables',
    ]);

    if (missingProperties.length) {
      const message = missingProperties
        .reduce(
          (accumulatedErrorMessage: string, nextMissingKey) =>
            accumulatedErrorMessage.concat(nextMissingKey + ','),
          'Missing the following required properties: '
        )
        // remove trailing comma
        .slice(0, -1);

      // TODO return these errors
      throw new Error(message);
    }

    const { name, nameEnglish, entries } = dto as PartialDTO<VocabularyList>;

    if (
      !isStringWithNonzeroLength(name) &&
      !isStringWithNonzeroLength(nameEnglish)
    )
      throw new Error(
        'A vocabulary list must have a name in at least one language'
      );

    if (!Array.isArray(entries))
      throw new Error(
        `Invalid format for vocabulary list entries: ${typeof entries}`
      );

    if (entries.length === 0)
      throw new Error('A vocabulary list must have at least one entry');

    // TODO validate types
    return true;
  }
}
