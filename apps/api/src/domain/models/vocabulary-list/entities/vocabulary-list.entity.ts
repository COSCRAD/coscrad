import { NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import VocabularyListWithNoEntriesCannotBePublishedError from '../../../domainModelValidators/errors/vocabularyList/vocabulary-list-with-no-entries-cannot-be-published.error';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { CREATE_VOCABULARY_LIST } from '../commands/create-vocabulary-list';
import { DuplicateVocabularyListNameError } from '../errors';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

@RegisterIndexScopedCommands([CREATE_VOCABULARY_LIST])
export class VocabularyList extends Resource {
    readonly type = ResourceType.vocabularyList;

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'the name of the vocabulary list',
    })
    name: MultilingualText;

    @NestedDataType(VocabularyListEntry, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'entries',
        description: 'all terms in this vocabulary list with corresponding filter properties',
    })
    readonly entries: VocabularyListEntry[];

    @NestedDataType(VocabularyListVariable, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'filters',
        description: 'defines a dynamic form that can be used to filter the entries',
    })
    readonly variables: VocabularyListVariable[];

    constructor(dto: DTO<VocabularyList>) {
        super({ ...dto, type: ResourceType.vocabularyList });

        if (!dto) return;

        const { name, entries, variables } = dto;

        this.name = new MultilingualText(name);

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

    getName(): MultilingualText {
        return this.name.clone();
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { name, id, entries } = this;

        const nameValidationResult = name.validateComplexInvariants();

        // TODO Validate vocabulary list variables against entry variables

        if (!isValid(nameValidationResult)) allErrors.push(nameValidationResult);

        if (!Array.isArray(entries) || !entries.length) {
            if (this.published)
                allErrors.push(new VocabularyListWithNoEntriesCannotBePublishedError(id));
        }

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.entries.map(({ termId }) => ({
            type: AggregateType.term,
            id: termId,
        }));
    }

    public validateExternalState(snapshot: InMemorySnapshot): ValidationResult {
        const {
            resources: { vocabularyList: otherVocabularyLists },
        } = snapshot;

        const vocabularyListsWithTheSameName = otherVocabularyLists.filter(({ name }) =>
            isDeepStrictEqual(this.name.getOriginalTextItem(), name.getOriginalTextItem())
        );

        const nameCollisionErrors = vocabularyListsWithTheSameName.map(
            (existingVocabularyList) =>
                new DuplicateVocabularyListNameError(
                    this.getCompositeIdentifier(),
                    existingVocabularyList.getCompositeIdentifier(),
                    existingVocabularyList.name.getOriginalTextItem()
                )
        );

        const externalReferenceValidationResult = this.validateExternalReferences(snapshot);

        const externalReferenceErrors = isValid(externalReferenceValidationResult)
            ? []
            : [externalReferenceValidationResult];

        const idErrors = this.validateIdIsUnique(snapshot);

        const allErrors = [...nameCollisionErrors, ...idErrors, ...externalReferenceErrors];

        return allErrors.length > 0 ? new InvalidExternalStateError(nameCollisionErrors) : Valid;
    }

    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }
}
