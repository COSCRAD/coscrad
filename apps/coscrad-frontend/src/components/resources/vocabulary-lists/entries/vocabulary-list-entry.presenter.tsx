import {
    HttpStatusCode,
    IDynamicForm,
    IVocabularyListEntry,
    IVocabularyListEntryTable,
} from '@coscrad/api-interfaces';
import { ErrorDisplay } from '../../../error-display/error-display';
import { VocabularyListEntryViewType } from './vocabulary-list-entry-view-type.enum';
import { VocabularyListEntryCarouselPresenter } from './vocabulary-list-entry.carousel.presenter';
import { VocabularyListEntryTableViewPresenter } from './vocabulary-list-entry.table.presenter';

export interface VocabularyListEntryPresenterProps {
    viewType: VocabularyListEntryViewType;
    entries: IVocabularyListEntry<boolean | string>[];
    form: IDynamicForm;
    table: IVocabularyListEntryTable;
}

export const VocabularyListEntryPresenter = ({
    viewType,
    form,
    entries,
    table,
}: VocabularyListEntryPresenterProps): JSX.Element => {
    if (viewType === VocabularyListEntryViewType.Carousel) {
        return <VocabularyListEntryCarouselPresenter entries={entries} form={form} />;
    }

    if (viewType === VocabularyListEntryViewType.Table) {
        return <VocabularyListEntryTableViewPresenter table={table} />;
    }

    // exhaustive check
    return (
        <ErrorDisplay
            code={HttpStatusCode.internalError}
            message={`Unsupported view type: ${viewType}`}
        />
    );
};
