import {
    CategorizableType,
    CategorizableTypeToViewModel,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';

export type IndexPresenter<T extends CategorizableType> = (
    indexResult: IIndexQueryResult<CategorizableTypeToViewModel[T]>
) => JSX.Element;

export interface CategorizableIndexPresenterFactory {
    (categorizableType: CategorizableType): IndexPresenter<typeof categorizableType>;
}
