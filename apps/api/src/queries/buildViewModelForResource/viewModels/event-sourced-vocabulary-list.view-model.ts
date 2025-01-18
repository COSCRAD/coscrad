import {
    ContributorWithId,
    FormFieldType,
    IDynamicForm,
    IFormField,
    IMultilingualText,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import {
    FilterPropertyType,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../../../domain/models/vocabulary-list/commands';
import { VocabularyListEntry } from '../../../domain/models/vocabulary-list/vocabulary-list-entry.entity';

export class VocabularyListViewModel implements IVocabularyListViewModel {
    @ApiProperty({
        type: VocabularyListEntry,
        isArray: true,
    })
    entries: IVocabularyListEntry<string | boolean>[];
    // TODO We need a concrete class to include this on the API docs
    form: IDynamicForm;
    contributions: ContributorWithId[];
    @ApiProperty({
        type: MultilingualText,
    })
    name: IMultilingualText;
    @ApiProperty()
    id: string;
    // note that these are mapped to form specifications in the query service layer
    @ApiProperty()
    actions: string[];
    @ApiProperty()
    isPublished: boolean;
    // this should be removed in query responses
    accessControlList: { allowedUserIds: string[]; allowedGroupIds: string[] };

    static fromVocabularyListCreated({
        payload: {
            name: textForName,
            languageCodeForName,
            aggregateCompositeIdentifier: { id: vocabularyListId },
        },
    }: VocabularyListCreated): VocabularyListViewModel {
        const view = new VocabularyListViewModel();

        view.id = vocabularyListId;

        view.isPublished = false;

        view.entries = [];

        view.form = {
            fields: [],
        };

        view.contributions = [];

        // TODO we should serialize when returning from the query service automatically so we can use instances here if we'd like
        view.name = buildMultilingualTextWithSingleItem(textForName, languageCodeForName).toDTO();

        view.actions = [
            'PUBLISH_RESOURCE',
            'CREATE_NOTE_ABOUT_RESOURCE',
            'CONNECT_RESOURCES_WITH_NOTE',
            'TRANSLATE_VOCABULARY_LIST_NAME',
            'ADD_TERM_TO_VOCABULARY_LIST',
            'REGISTER_VOCABULARY_LIST_FILTER_PROPERTY',
        ];

        view.accessControlList = new AccessControlList();

        return view;
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
}
