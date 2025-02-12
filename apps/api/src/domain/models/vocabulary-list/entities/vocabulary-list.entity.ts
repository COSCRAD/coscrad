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
import { AggregateRoot, UpdateMethod } from '../../../decorators';
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
    EntriesImportedToVocabularyList,
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
    FailedToImportEntriesToVocabularyListError,
} from '../errors';
import { CannotImportToVocabularyListWithExistingEntriesError } from '../errors/cannot-import-to-vocabulary-list-with-existing-entries.error';
import { EmptyVocabularyListImportRequestError } from '../errors/empty-vocabulary-list-import-request.error';
import { InvalidVocabularyListEntryInImportError } from '../errors/invalid-entry-in-import.error';
import { InvalidVocabularyListFilterPropertyValueError } from '../errors/invalid-vocabulary-list-filter-property-value.error';
import { VocabularyListEntryNotFoundError } from '../errors/vocabulary-list-entry-not-found.error';
import { VocabularyListFilterPropertyMustHaveAtLeastOneAllowedValueError } from '../errors/vocabulary-list-filter-property-must-have-at-least-one-allowed-value.error';
import { VocabularyListFilterPropertyNotFoundError } from '../errors/vocabulary-list-filter-property-not-found.error';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListFilterProperty } from './vocabulary-list-variable.entity';

export type VocabularyListEntryImportItem = {
    termId: AggregateId;

    propertyValues: Record<string, boolean | string>;
};

// TODO break out this type
type LabelAndValue<T = string> = {
    label: string;
    value: T;
};

@AggregateRoot(AggregateType.vocabularyList)
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
    entries: VocabularyListEntry[];

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
    variables: VocabularyListFilterProperty[];

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

    @UpdateMethod()
    translateName(textItem: MultilingualTextItem): ResultOrError<VocabularyList> {
        if (this.name.items.some(({ languageCode }) => languageCode === textItem.languageCode))
            return new DuplicateLanguageInMultilingualTextError(textItem.languageCode);

        const nameUpdateResult = this.name.translate(textItem);

        if (isInternalError(nameUpdateResult)) return nameUpdateResult;

        this.name = nameUpdateResult;

        return this;
    }

    @UpdateMethod()
    addEntry(termId: AggregateId): ResultOrError<VocabularyList> {
        if (this.hasEntryForTerm(termId))
            return new CannotAddMultipleEntriesForSingleTermError(termId, this.id);

        const newEntry = new VocabularyListEntry({
            termId,
            variableValues: {},
        });

        this.entries = this.entries.concat(newEntry);

        return this;
    }

    @UpdateMethod()
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

    @UpdateMethod()
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

        this.entries = updatedEntries;

        return this;
    }

    // TODO should type be an enum?
    @UpdateMethod()
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

        this.variables.push(
            new VocabularyListFilterProperty({
                name,
                type: mappedType,
                validValues: allowedValuesWithLabels.map(({ label, value }) => ({
                    value,
                    display: label,
                })),
            })
        );

        return this;
    }

    @UpdateMethod()
    importEntries(importItems: VocabularyListEntryImportItem[]): ResultOrError<VocabularyList> {
        if (this.entries.length > 0) {
            return new FailedToImportEntriesToVocabularyListError(this.id, [
                new CannotImportToVocabularyListWithExistingEntriesError(),
            ]);
        }

        if (importItems.length === 0) {
            return new FailedToImportEntriesToVocabularyListError(this.id, [
                new EmptyVocabularyListImportRequestError(),
            ]);
        }

        const unknownFilterPropertyErrors = importItems
            .flatMap(({ termId, propertyValues }) => {
                const missingProperties = Object.keys(propertyValues).filter(
                    (propertyValue) => !this.hasFilterPropertyNamed(propertyValue)
                );

                return missingProperties.map((missingProperty) => ({
                    termId,
                    missingProperty,
                }));
            })
            .map(
                ({ termId, missingProperty }) =>
                    new InvalidVocabularyListEntryInImportError(termId, [
                        new VocabularyListFilterPropertyNotFoundError(missingProperty, this.id),
                    ])
            );

        if (unknownFilterPropertyErrors.length > 0) {
            return new FailedToImportEntriesToVocabularyListError(
                this.id,
                unknownFilterPropertyErrors
            );
        }

        const unknownPropertyValueErrors = importItems
            .flatMap(({ termId, propertyValues }) =>
                Object.entries(propertyValues).flatMap(([propertyName, propertyValue]) => {
                    const knownProperty = this.getFilterPropertyByName(
                        propertyName
                    ) as VocabularyListFilterProperty;

                    const { validValues } = knownProperty;

                    return validValues.some(({ value }) => value === propertyValue)
                        ? []
                        : [
                              {
                                  propertyName,
                                  propertyValue,
                                  termId,
                              },
                          ];
                })
            )
            .map(
                ({ termId, propertyName, propertyValue }) =>
                    new InvalidVocabularyListEntryInImportError(termId, [
                        new InvalidVocabularyListFilterPropertyValueError(
                            propertyName,
                            propertyValue,
                            this.id
                        ),
                    ])
            );

        if (unknownPropertyValueErrors.length > 0) {
            return new FailedToImportEntriesToVocabularyListError(
                this.id,
                unknownPropertyValueErrors
            );
        }

        this.entries.push(
            ...importItems.map(
                ({ termId, propertyValues }) =>
                    new VocabularyListEntry({ termId, variableValues: propertyValues })
            )
        );

        return this;
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

    handleEntriesImportedToVocabularyList({
        payload: { entries },
    }: EntriesImportedToVocabularyList) {
        return this.importEntries(entries);
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
