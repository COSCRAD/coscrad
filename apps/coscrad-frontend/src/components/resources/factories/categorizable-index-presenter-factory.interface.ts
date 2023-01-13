import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICategorizableIndexQueryResult,
} from '@coscrad/api-interfaces';

export type CategorizableIndexPresenter<T extends CategorizableType> = (
    indexResult: ICategorizableIndexQueryResult<AggregateTypeToViewModel[T]>
) => JSX.Element;

export interface CategorizableIndexPresenterFactory {
    (categorizableType: CategorizableType): CategorizableIndexPresenter<typeof categorizableType>;
}
