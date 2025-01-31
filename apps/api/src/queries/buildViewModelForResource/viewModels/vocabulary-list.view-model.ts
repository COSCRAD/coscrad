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
import {
    FilterPropertyType,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../../../domain/models/vocabulary-list/commands';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';
import { TermViewModel } from './term.view-model';

export class VocabularyListEntryViewModel extends BaseDomainModel {
    // note this doesn't quite line up with the `IVocabularyListViewModel` interface
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
}

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

    // this should be removed in query responses
    public accessControlList: { allowedUserIds: string[]; allowedGroupIds: string[] };

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
            actions: ['ADD_TERM_TO_VOCABULARY_LIST', 'PUBLISH_RESOURCE'],
        };

        const view = new VocabularyListViewModel(dto);

        return view;
    }

    static fromDto(dto: DTO<VocabularyListViewModel>): VocabularyListViewModel {
        const vl = new VocabularyListViewModel(dto);

        return vl;
    }
}
