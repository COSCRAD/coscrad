import { NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../common/entities/multilingual-text';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import VocabularyListWithNoEntriesCannotBePublishedError from '../../../domainModelValidators/errors/vocabularyList/vocabulary-list-with-no-entries-cannot-be-published.error';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { DuplicateLanguageInMultilingualTextError } from '../../audio-visual/audio-item/errors/duplicate-language-in-multilingual-text.error';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../build-aggregate-root-from-event-history';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { BaseEvent } from '../../shared/events/base-event.entity';
import {
    FilterPropertyType,
    TermAddedToVocabularyList,
    TermInVocabularyListAnalyzed,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../commands';
import { ADD_TERM_TO_VOCABULARY_LIST } from '../commands/add-term-to-vocabulary-list/constants';
import { ANALYZE_TERM_IN_VOCABULARY_LIST } from '../commands/analyze-term-in-vocabulary-list/constants';
import { TRANSLATE_VOCABULARY_LIST_NAME } from '../commands/translate-vocabulary-list-name/constants';
import { VocabularyListNameTranslated } from '../commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import {
    CannotAddMultipleEntriesForSingleTermError,
    CannotHaveTwoFilterPropertiesWithTheSameNameError,
    DuplicateVocabularyListNameError,
    FailedToAnalyzeVocabularyListEntryError,
} from '../errors';
import { InvalidVocabularyListFilterPropertyValueError } from '../errors/invalid-vocabulary-list-filter-property-value.error';
import { VocabularyListEntryNotFoundError } from '../errors/vocabulary-list-entry-not-found.error';
import { VocabularyListFilterPropertyMustHaveAtLeastOneAllowedValueError } from '../errors/vocabulary-list-filter-property-must-have-at-least-one-allowed-value.error';
import { VocabularyListFilterPropertyNotFoundError } from '../errors/vocabulary-list-filter-property-not-found.error';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListFilterProperty } from './vocabulary-list-variable.entity';

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
    @NestedDataType(VocabularyListFilterProperty, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'filters',
        description: 'defines a dynamic form that can be used to filter the entries',
    })
    readonly variables: VocabularyListFilterProperty[];

    constructor(dto: DTO<VocabularyList>) {
        super({ ...dto, type: ResourceType.vocabularyList });

        if (!dto) return;

        const { name, entries, variables } = dto;

        this.name = new MultilingualText(name);

        this.entries = Array.isArray(entries)
            ? entries.map((entryDto) => new VocabularyListEntry(entryDto))
            : null;

        this.variables = Array.isArray(variables)
            ? variables.map((v) => new VocabularyListFilterProperty(v))
            : null;
    }

    getName(): MultilingualText {
        return this.name.clone();
    }

    hasEntryForTerm(termId: AggregateId): boolean {
        return this.entries.some((entry) => termId === entry.termId);
    }

    getEntryForTerm(termId: AggregateId): Maybe<VocabularyListEntry> {
        return this.entries.find((entry) => termId === entry.termId) || NotFound;
    }

    findEntries(
        propertyValueSpecification: Record<string, boolean | string>
    ): VocabularyListEntry[] {
        return this.entries.filter((entry) => entry.doesMatchAll(propertyValueSpecification));
    }

    hasFilterPropertyNamed(name: string): boolean {
        // TODO rename `variables` to `filterProperties`
        return this.variables.some((filterProperty) => filterProperty.name === name);
    }

    getFilterPropertyByName(name: string): Maybe<VocabularyListFilterProperty> {
        const searchResult = this.variables.find((FilterProperty) => FilterProperty.name === name);

        return isNullOrUndefined(searchResult) ? NotFound : searchResult;
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

    analyzeEntry(
        termId: AggregateId,
        propertyNamesAndValues: Record<string, string | boolean>
    ): ResultOrError<VocabularyList> {
        return Object.entries(propertyNamesAndValues).reduce(
            (acc: ResultOrError<VocabularyList>, [propertyName, propertyValue]) =>
                isInternalError(acc)
                    ? acc
                    : acc.analyzeEntryForSingleProperty(termId, propertyName, propertyValue),
            this
        );
    }

    analyzeEntryForSingleProperty(
        termId: AggregateId,
        propertyName: string,
        propertyValue: string | boolean
    ): ResultOrError<VocabularyList> {
        const entrySearchResult = this.entries.find((entry) => entry.termId === termId);

        if (isNullOrUndefined(entrySearchResult)) {
            return new VocabularyListEntryNotFoundError(termId, this.id);
        }

        const filterPropertySearchResult = this.variables.find(({ name }) => name === propertyName);

        if (isNullOrUndefined(filterPropertySearchResult)) {
            return new VocabularyListFilterPropertyNotFoundError(propertyName, this.id);
        }

        if (!filterPropertySearchResult.isAllowedValue(propertyValue)) {
            return new InvalidVocabularyListFilterPropertyValueError(
                propertyName,
                propertyValue,
                this.id
            );
        }

        const entryUpdateResult = entrySearchResult.analyze(propertyName, propertyValue);

        if (isInternalError(entryUpdateResult)) {
            return new FailedToAnalyzeVocabularyListEntryError(termId, this.id, [
                entryUpdateResult,
            ]);
        }

        const updatedEntries = this.entries.map((entry) =>
            entry.termId === termId ? entryUpdateResult : entry.clone({})
        );

        return this.clone<VocabularyList>({
            entries: updatedEntries,
        });
    }

    // TODO should type be an enum?
    registerFilterProperty(
        name: string,
        type: FilterPropertyType,
        allowedValuesWithLabels: LabelAndValue<string | boolean>[]
    ): ResultOrError<VocabularyList> {
        /**
         * This is necessary until a migration \ event versioning occurs so we can
         * rename the properties on existing data.
         */
        const mappedType =
            type === FilterPropertyType.selection
                ? DropboxOrCheckbox.dropbox
                : DropboxOrCheckbox.checkbox;

        // TODO add unit test for this
        if (allowedValuesWithLabels.length === 0) {
            return new VocabularyListFilterPropertyMustHaveAtLeastOneAllowedValueError(
                this.id,
                name
            );
        }

        if (this.hasFilterPropertyNamed(name)) {
            return new CannotHaveTwoFilterPropertiesWithTheSameNameError(name, this.id);
        }

        const newVocabularyList = this.safeClone<VocabularyList>({
            variables: [
                ...this.variables
                    .map((variable) => variable.toDTO())
                    .concat({
                        name,
                        type: mappedType,
                        validValues: allowedValuesWithLabels.map(({ label, value }) => ({
                            value,
                            display: label,
                        })),
                    } as DTO<VocabularyListFilterProperty>)
                    .map((dto) => new VocabularyListFilterProperty(dto)),
            ],
        });

        return newVocabularyList;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [
            TRANSLATE_VOCABULARY_LIST_NAME,
            ADD_TERM_TO_VOCABULARY_LIST,
            ANALYZE_TERM_IN_VOCABULARY_LIST,
        ];
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

    handleVocabularyListNameTranslated({
        payload: { text, languageCode },
    }: VocabularyListNameTranslated) {
        return this.translateName(
            new MultilingualTextItem({
                text,
                languageCode,
                // Do we really want to expose this here? Shouldn't the update method hardwire this?
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }

    handleTermAddedToVocabularyList({ payload: { termId } }: TermAddedToVocabularyList) {
        return this.addEntry(termId);
    }

    handleVocabularyListFilterPropertyRegistered({
        payload: { name, type, allowedValuesAndLabels },
    }: VocabularyListFilterPropertyRegistered) {
        return this.registerFilterProperty(name, type, allowedValuesAndLabels);
    }

    handleTermInVocabularyListAnalyzed({
        payload: { termId, propertyValues },
    }: TermInVocabularyListAnalyzed) {
        return this.analyzeEntry(termId, propertyValues);
    }

    static fromEventHistory(
        eventStream: BaseEvent[],
        vocabularyListId: AggregateId
    ): ResultOrError<Maybe<VocabularyList>> {
        const creationEventHandlerMap: CreationEventHandlerMap<VocabularyList> = new Map().set(
            `VOCABULARY_LIST_CREATED`,
            VocabularyList.createVocabularyListFromVocabularyListCreated
        );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            },
            eventStream
        );
    }

    private static createVocabularyListFromVocabularyListCreated(
        event: VocabularyListCreated
    ): ResultOrError<Maybe<VocabularyList>> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                name,
                languageCodeForName,
            },
        } = event;

        return new VocabularyList({
            type: AggregateType.vocabularyList,
            id,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            entries: [],
            variables: [],
            published: false,
        });
    }
}
