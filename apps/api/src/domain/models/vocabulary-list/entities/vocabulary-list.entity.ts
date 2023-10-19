import { NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import VocabularyListWithNoEntriesCannotBePublishedError from '../../../domainModelValidators/errors/vocabularyList/vocabulary-list-with-no-entries-cannot-be-published.error';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { DuplicateLanguageInMultilingualTextError } from '../../audio-item/errors/duplicate-language-in-multilingual-text.error';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { ADD_TERM_TO_VOCABULARY_LIST } from '../commands/add-term-to-vocabulary-list/constants';
import { TRANSLATE_VOCABULARY_LIST_NAME } from '../commands/translate-vocabulary-list-name/constants';
import {
    CannotAddMultipleEntriesForSingleTermError,
    CannotHaveTwoFilterPropertiesWithTheSameNameError,
    DuplicateVocabularyListNameError,
} from '../errors';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListVariable } from './vocabulary-list-variable.entity';

// TODO break out this type
type LabelAndValue<T = string> = {
    label: string;
    value: T;
};

@RegisterIndexScopedCommands([`CREATE_VOCABULARY_LIST`])
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

    /**
     * TODO rename this `property filters`
     */
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
         * TODO Add this
         * Missing invariant- each variable must have a unique name.
         */
        this.variables = Array.isArray(variables)
            ? variables.map((v) => new VocabularyListVariable(v))
            : null;
    }

    getName(): MultilingualText {
        return this.name.clone();
    }

    hasEntryForTerm(termId: AggregateId): boolean {
        return this.entries.some((entry) => termId === entry.termId);
    }

    hasFilterPropertyNamed(name: string): boolean {
        // TODO rename `variables` to `filterProperties`
        return this.variables.some((filterProperty) => filterProperty.name === name);
    }

    translateName(textItem: MultilingualTextItem): ResultOrError<VocabularyList> {
        if (this.name.items.some(({ languageCode }) => languageCode === textItem.languageCode))
            return new DuplicateLanguageInMultilingualTextError(textItem.languageCode);

        const nameUpdateResult = this.name.translate(textItem);

        if (isInternalError(nameUpdateResult)) return nameUpdateResult;

        return this.safeClone<VocabularyList>({
            name: nameUpdateResult,
        });
    }

    addEntry(termId: AggregateId): ResultOrError<VocabularyList> {
        if (this.hasEntryForTerm(termId))
            return new CannotAddMultipleEntriesForSingleTermError(termId, this.id);

        const newEntry = new VocabularyListEntry({
            termId,
            variableValues: {},
        });

        return this.safeClone<VocabularyList>({
            entries: this.entries.concat(newEntry),
        });
    }

    // TODO should type be an enum?
    registerFilterProperty(
        name: string,
        type: string,
        allowedValuesWithLabels: LabelAndValue[]
    ): ResultOrError<VocabularyList> {
        if (this.hasFilterPropertyNamed(name)) {
            return new CannotHaveTwoFilterPropertiesWithTheSameNameError(name, this.id);
        }

        const newVocabularyList = this.safeClone<VocabularyList>({
            variables: [
                // TODO use a constructor for VocabularyListVariable here
                ...this.variables
                    .map((variable) => variable.toDTO())
                    .concat({
                        name,
                        type,
                        validValues: cloneToPlainObject(allowedValuesWithLabels),
                    } as DTO<VocabularyListVariable>)
                    .map((dto) => new VocabularyListVariable(dto)),
            ],
        });

        return newVocabularyList;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [TRANSLATE_VOCABULARY_LIST_NAME, ADD_TERM_TO_VOCABULARY_LIST];
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

        // We `flatmap` because each validation call per variable returns an array of errors
        const filterPropertyValidationResult = this.variables.flatMap((variable) =>
            variable.validateComplexInvariants()
        );

        allErrors.push(...filterPropertyValidationResult);

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
