import { CategorizableType } from '@coscrad/api-interfaces';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';
import { SelectedCategorizableContainer } from './selected-resources.container';

export type CategorizableTypeAndSelectedIds = { [K in CategorizableType]?: string[] };

interface ResourcesOfMultipleTypeContainerProps<T> {
    categorizableTypeAndIds: CategorizableTypeAndSelectedIds;
    detailPresenterFactory: ICategorizableDetailPresenterFactory<T>;
    heading?: string;
}

export const CategorizableOfMultipleTypeContainer = <T,>({
    categorizableTypeAndIds,
    detailPresenterFactory: resourceDetailPresenterFactory,
    heading,
}: ResourcesOfMultipleTypeContainerProps<T>): JSX.Element => (
    <div>
        <h3>{heading || 'Selected Resources'}</h3>
        {Object.entries(categorizableTypeAndIds).map(
            ([categorizableType, selectedIds]: [CategorizableType, string[]]) => (
                <SelectedCategorizableContainer
                    categorizableType={categorizableType}
                    detailPresenterFactory={resourceDetailPresenterFactory}
                    selectedIds={selectedIds}
                />
            )
        )}
    </div>
);
