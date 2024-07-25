import {
    ContributorWithId,
    FormFieldType,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IDynamicForm,
    IFormField,
    IMultilingualText,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import {
    FilterPropertyType,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../../../domain/models/vocabulary-list/commands';

export class EventSourcedVocabularyListViewModel
    implements IDetailQueryResult<IVocabularyListViewModel>
{
    entries: IVocabularyListEntry<string | boolean>[];
    form: IDynamicForm;
    contributions: ContributorWithId[];
    name: IMultilingualText;
    id: string;
    actions: ICommandFormAndLabels[];
    isPublished: boolean;
    accessControlList: { allowedUserIds: string[]; allowedGroupIds: string[] };

    static fromVocabularyListCreated({
        payload: {
            name: textForName,
            languageCodeForName,
            aggregateCompositeIdentifier: { id: vocabularyListId },
        },
    }: VocabularyListCreated): EventSourcedVocabularyListViewModel {
        const view = new EventSourcedVocabularyListViewModel();

        view.id = vocabularyListId;

        view.isPublished = false;

        view.entries = [];

        view.form = {
            fields: [],
        };

        view.contributions = [];

        // TODO we should serialize when returning from the query service automatically so we can use instances here if we'd like
        view.name = buildMultilingualTextWithSingleItem(textForName, languageCodeForName).toDTO();

        view.actions = [];

        view.accessControlList = new AccessControlList();

        return view;
    }

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
