import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import VocabularyListHasNoEntriesError from '../../../domainModelValidators/errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from '../../../domainModelValidators/errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

const isOptional = true;
@RegisterIndexScopedCommands([])
export class VocabularyList extends Resource {
    readonly type = ResourceType.vocabularyList;

    @NonEmptyString({
        isOptional,
        label: 'name (language)',
        description: 'name of the vocabulary list in the language',
    })
    readonly name?: string;

    @NonEmptyString({
        isOptional,
        label: 'name (colonial language)',
        description: 'name of the vocabulary list in the colonial language',
    })
    readonly nameEnglish?: string;

    @NestedDataType(VocabularyListEntry, {
        isArray: true,
        label: 'entries',
        description: 'all terms in this vocabulary list with corresponding filter properties',
    })
    readonly entries: VocabularyListEntry[];

    @NestedDataType(VocabularyListVariable, {
        isArray: true,
        label: 'filters',
        description: 'defines a dynamic form that can be used to filter the entries',
    })
    readonly variables: VocabularyListVariable[];

    constructor(dto: DTO<VocabularyList>) {
        super({ ...dto, type: ResourceType.vocabularyList });

        if (!dto) return;

        const { name, nameEnglish, entries, variables } = dto;

        this.name = name;

        this.nameEnglish = nameEnglish;

        this.entries = Array.isArray(entries)
            ? entries.map((entryDto) => new VocabularyListEntry(entryDto))
            : null;

        /**
         * Missing invariant- each variable must have a unique name.
         */
        this.variables = Array.isArray(variables)
            ? variables.map((v) => (isNullOrUndefined(v) ? v : cloneToPlainObject(v)))
            : null;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { name, nameEnglish, id, entries } = this;

        // TODO Validate vocabulary list variables against entry variables

        if (!isNonEmptyString(name) && !isNonEmptyString(nameEnglish))
            allErrors.push(new VocabularyListHasNoNameInAnyLanguageError());

        if (!Array.isArray(entries) || !entries.length)
            allErrors.push(new VocabularyListHasNoEntriesError(id));

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.entries.map(({ termId }) => ({
            type: AggregateType.term,
            id: termId,
        }));
    }

    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }
}
