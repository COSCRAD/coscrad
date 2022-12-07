import { CategorizableCompositeIdentifier, CategorizableType } from '@coscrad/api-interfaces';
import { buildPluralLabelsMapForCategorizableTypes } from '../../store/slices/resources/shared/connected-resources/build-plural-labels-map-for-categorizable-types';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';
import { SelectedCategorizablesOfSingleTypeContainer } from './selected-categorizables-of-single-type.container';

export type CategorizableTypeAndSelectedIds = { [K in CategorizableType]?: string[] };

interface CategorizablesOfMultipleTypeContainerProps<T> {
    members: CategorizableCompositeIdentifier[];
    detailPresenterFactory: ICategorizableDetailPresenterFactory<T>;
    heading?: string;
}

/**
 * We build an object with each key (category type) pointing to an empty array
 * as the initial value for the subsequent reduce. This avoids having the logic
 * to initialize each key with an empty array show up in a conditional in the
 * reducer, improving readability.
 */
const buildInitialEmptyResourceTypesAndSelectedIds = (
    members: CategorizableCompositeIdentifier[]
) =>
    [...new Set(members.map(({ type }) => type))].reduce(
        (acc, resourceType) => ({
            ...acc,
            [resourceType]: [],
        }),
        {}
    );

// A Map might improve readability here
const collectResourceTypesAndSelectedIds = (members: CategorizableCompositeIdentifier[]) =>
    members.reduce(
        (acc, { type: resourceType, id }) => ({
            ...acc,
            [resourceType]: acc[resourceType].concat(id),
        }),
        buildInitialEmptyResourceTypesAndSelectedIds(members)
    );

/**
 * TODO Let's update `CategorizablesOfMultipleTypesContainer` to take in
 * `members: ResourceCompositeIdentifier[]` to avoid repeatedly parsing this
 * by the clients.
 */
export const CategorizablesOfMultipleTypeContainer = <T,>({
    members,
    detailPresenterFactory,
    heading,
}: CategorizablesOfMultipleTypeContainerProps<T>): JSX.Element => (
    <div>
        <h3>{heading || 'Selected Resources'}</h3>
        {Object.entries(collectResourceTypesAndSelectedIds(members)).map(
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
