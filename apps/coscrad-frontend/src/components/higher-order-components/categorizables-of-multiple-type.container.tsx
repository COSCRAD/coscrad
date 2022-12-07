import { CategorizableType } from '@coscrad/api-interfaces';
import { buildPluralLabelsMapForCategorizableTypes } from '../../store/slices/resources/shared/connected-resources/build-plural-labels-map-for-categorizable-types';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';
import { SelectedCategorizablesOfSingleTypeContainer } from './selected-categorizables-of-single-type.container';

export type CategorizableTypeAndSelectedIds = { [K in CategorizableType]?: string[] };

interface CategorizablesOfMultipleTypeContainerProps<T> {
    categorizableTypeAndIds: CategorizableTypeAndSelectedIds;
    detailPresenterFactory: ICategorizableDetailPresenterFactory<T>;
    heading?: string;
}

/**
 * TODO Let's update `CategorizablesOfMultipleTypesContainer` to take in
 * `members: ResourceCompositeIdentifier[]` to avoid repeatedly parsing this
 * by the clients.
 */
export const CategorizablesOfMultipleTypeContainer = <T,>({
    categorizableTypeAndIds,
    detailPresenterFactory,
    heading,
}: CategorizablesOfMultipleTypeContainerProps<T>): JSX.Element => (
    <div>
        <h3>{heading || 'Selected Resources'}</h3>
        {Object.entries(categorizableTypeAndIds).map(
            ([categorizableType, selectedIds]: [CategorizableType, string[]]) => (
                <SelectedCategorizablesOfSingleTypeContainer
                    categorizableType={categorizableType}
                    detailPresenterFactory={detailPresenterFactory}
                    selectedIds={selectedIds}
                    pluralLabelForCategorizableType={buildPluralLabelsMapForCategorizableTypes().get(
                        categorizableType
                    )}
                />
            )
        )}
    </div>
);
