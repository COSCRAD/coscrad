import {
    HttpStatusCode,
    IDynamicForm,
    IVocabularyListEntry,
    IVocabularyListEntryTable,
} from '@coscrad/api-interfaces';
import { ErrorDisplay } from '../../../error-display/error-display';
import { NotFoundPresenter } from '../../../not-found';
import { VocabularyListEntryViewType } from './vocabulary-list-entry-view-type.enum';
import { VocabularyListEntryCarouselPresenter } from './vocabulary-list-entry.carousel.presenter';

export interface VocabularyListEntryPresenterProps {
    viewType: VocabularyListEntryViewType;
    entries: IVocabularyListEntry<boolean | string>[];
    form: IDynamicForm;
    table: IVocabularyListEntryTable;
}

const VocabularyListTableViewPresenter = (): JSX.Element => {
    return <NotFoundPresenter />;
};

export const VocabularyListEntryPresenter = ({
    viewType,
    form,
    entries,
}: VocabularyListEntryPresenterProps): JSX.Element => {
    if (viewType === VocabularyListEntryViewType.Carousel) {
        return <VocabularyListEntryCarouselPresenter entries={entries} form={form} />;
    }

    // exhaustive check
    return (
        <ErrorDisplay
            code={HttpStatusCode.internalError}
            message={`Unsupported view type: ${viewType}`}
        />
    );
};
