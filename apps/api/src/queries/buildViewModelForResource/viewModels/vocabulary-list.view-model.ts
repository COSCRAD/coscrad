import {
    AggregateType,
    ContributorWithId,
    FormFieldType,
    IDynamicForm,
    IFormField,
    IMultilingualText,
} from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import BaseDomainModel from '../../../domain/models/base-domain-model.entity';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import {
    FilterPropertyType,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../../../domain/models/vocabulary-list/commands';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { TermViewModel } from './term.view-model';

export class VocabularyListEntryViewModel extends BaseDomainModel {
    /**
     * Note this doesn't quite line up with the `IVocabularyListViewModel` interface.
     * This isn't a problem because we don't need to know the available actions
     * on the nested term view as it stands. This is only important if we want to
     * allow user actions to be nested in components on the client. We may consider
     * this if we move to SSR, but it's not important right now.
     */
    term: TermViewModel;

    variableValues: Record<string, string | boolean>;

    constructor(dto?: Partial<DTO<VocabularyListEntryViewModel>>) {
        super();

        if (!isNonEmptyObject(dto)) {
            return;
        }

        const { term: termDto, variableValues } = dto;

        this.term = TermViewModel.fromDto(termDto);

        this.variableValues = { ...variableValues };
    }

    public canUserWithGroups(userWithGroups: CoscradUserWithGroups) {
        const isAllowed =
            this.term.isPublished || this.term.accessControlList.canUserWithGroups(userWithGroups);

        return isAllowed;
    }
}

const sample: DTO<VocabularyListViewModel> = {
    entries: [
        {
            term: {
                id: '123',
                name: buildMultilingualTextWithSingleItem('test term in vocabulary list'),
                contributions: [],
                isPublished: false,
                actions: [],
                mediaItemId: '555',
                accessControlList: new AccessControlList().toDTO(),
            },
            variableValues: {},
        },
    ],
    form: {
        fields: [],
    },
    name: buildMultilingualTextWithSingleItem('vocab list name (orig)'),
    id: '123',
    actions: [],
    isPublished: false,
    contributions: [],
    accessControlList: new AccessControlList().toDTO(),
};

@CoscradDataExample({
    example: sample,
})
export class VocabularyListViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    @ApiProperty({
        type: VocabularyListEntryViewModel,
        isArray: true,
    })
    public entries: VocabularyListEntryViewModel[];

    // TODO We need a concrete class to include this on the API docs
    public form: IDynamicForm;

    public contributions: ContributorWithId[];

    @ApiProperty({
        type: MultilingualText,
    })
    public name: IMultilingualText;

    @ApiProperty()
    public id: string;

    // note that these are mapped to form specifications in the query service layer
    @ApiProperty()
    public actions: string[];

    @ApiProperty()
    public isPublished: boolean;

    /**
     * This should be removed in query responses.
     *
     * Note that if we leverage `forUser`, we should be able to make this
     * private.
     * */
    public accessControlList: AccessControlList;

    getAvailableCommands(): string[] {
        /**
         * TODO Let's not cache actions on the view documents. Let's instead
         * project off the view model state to determine the available commands types.
         */
        return this.actions || [];
    }

    getCompositeIdentifier(): { type: AggregateType; id: AggregateId } {
        return {
            type: AggregateType.vocabularyList,
            id: this.id,
        };
    }

    constructor(dto?: Partial<DTO<VocabularyListViewModel>>) {
        if (!isNonEmptyObject(dto)) {
            return;
        }

        const {
            id,
            isPublished,
            entries,
            form,
            contributions,
            name,
            actions,
            accessControlList: aclDto,
        } = dto;

        this.id = id;

        // out of an abundance of caution
        this.isPublished = typeof isPublished === 'boolean' ? isPublished : false;

        this.entries = Array.isArray(entries)
            ? entries.map((entryDto) => new VocabularyListEntryViewModel(entryDto))
            : [];

        // TODO investigate the need for a cast here
        this.form = isNonEmptyObject(form)
            ? (form as IDynamicForm)
            : {
                  fields: [] as IFormField[],
              };

        this.contributions = Array.isArray(contributions) ? contributions : [];

        this.name = new MultilingualText(name);

        this.actions = Array.isArray(actions) ? actions : [];

        this.accessControlList = new AccessControlList(aclDto);
    }

    /**
     * TODO If we really want to do this, we need to find a way to share the
     * logic with the event consumers. Unfortunately, the latter simply emit
     * deltas to the database with no up-front reads. It seems that we might
     * want a pattern where we calculate the delta to the view model for a given
     * event, and apply simply becomes pattern match + left fold over these deltas.
     *
     * For now, since the only use case is using event-sourced instead of state-based test setup,
     * we have decided to simpy change our approach to state based.
     */
    apply(event: ICoscradEvent) {
        if (event.isOfType('VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED')) {
            const {
                payload: { name, type: filterType, allowedValuesAndLabels },
            } = event as VocabularyListFilterPropertyRegistered;

            const newFormField: IFormField<string | boolean> = {
                name,
                description: `filter the vocabulary list based on the property: ${name}`,
                // TODO ensure this comes through when writing to the database
                type:
                    filterType === FilterPropertyType.checkbox
                        ? FormFieldType.switch
                        : FormFieldType.staticSelect,

                label: name,
                // TODO should we add these?
                constraints: [],
                options: allowedValuesAndLabels.map(({ label, value }) => ({
                    value,
                    display: label,
                })),
            };

            this.form.fields.push(newFormField);

            return this;
        }

        // event not handled
        return this;
    }

    static fromVocabularyListCreated({
        payload: {
            name: textForName,
            languageCodeForName,
            aggregateCompositeIdentifier: { id: vocabularyListId },
        },
    }: VocabularyListCreated): VocabularyListViewModel {
        const dto: Partial<DTO<VocabularyListViewModel>> = {
            name: buildMultilingualTextWithSingleItem(textForName, languageCodeForName),
            id: vocabularyListId,
            actions: [
                'ADD_TERM_TO_VOCABULARY_LIST',
                'PUBLISH_RESOURCE',
                'CREATE_NOTE_ABOUT_RESOURCE',
                'CONNECT_RESOURCES_WITH_NOTE',
                'TRANSLATE_VOCABULARY_LIST_NAME',
                'REGISTER_VOCABULARY_LIST_FILTER_PROPERTY',
            ],
        };

        const view = new VocabularyListViewModel(dto);

        return view;
    }

    static fromDto(dto: DTO<VocabularyListViewModel>): VocabularyListViewModel {
        const vl = new VocabularyListViewModel(dto);

        return vl;
    }

    // TODO move this to base model
    public toDto(): DTO<VocabularyListViewModel> {
        return cloneToPlainObject(this);
    }

    // TODO move this to base model
    public clone(overrides: DeepPartial<DTO<VocabularyListViewModel>>) {
        const dtoWithOverridesApplied = clonePlainObjectWithOverrides(this.toDto(), overrides);

        return VocabularyListViewModel.fromDto(dtoWithOverridesApplied);
    }

    /**
     * Note that this pattern requires us to hydrate the view model after fetching
     * a corresponding document from the database, even in the event that the user
     * does not have permission to access this. It would be ideal to check this
     * directly in the database.
     *
     * TODO Breakout functional helper and bind it to this here so we can have
     * a single-source of truth for this logic across resource types.
     */
    public forUser(
        userWithGroups?: CoscradUserWithGroups
    ): Maybe<Omit<VocabularyListViewModel, 'accessControlList'>> {
        /**
         * There are 2 branches in the conditional logic where we need to
         * do this, so I created a little helper here so we can do this lazily
         * without repetition.
         */
        const buildResult = () => {
            const availableEntries = this.entries.filter((entry) =>
                entry.canUserWithGroups(userWithGroups)
            );

            const withAvailableEntries = this.clone({
                entries: availableEntries,
            });

            delete withAvailableEntries.accessControlList;

            return withAvailableEntries;
        };

        /**
         * In this case, no user was provided.
         */
        if (!isNonEmptyObject(userWithGroups)) {
            return this.isPublished ? buildResult() : NotFound;
        }

        // Now we know we have a non-null `userWithGroups`

        if (this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups)) {
            /**
             * TODO Consider adding a method for mapping this to a client query
             * response DTO (removing hidden or irrelevant attributes, for example).
             */
            return buildResult();
        }

        return NotFound;
    }
}
