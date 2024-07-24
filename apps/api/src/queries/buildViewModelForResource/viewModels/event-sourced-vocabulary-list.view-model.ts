import {
    ContributorWithId,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IDynamicForm,
    IMultilingualText,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { VocabularyListCreated } from '../../../domain/models/vocabulary-list/commands';

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
}
