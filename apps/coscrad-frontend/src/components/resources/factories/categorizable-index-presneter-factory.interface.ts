import {
    CategorizableType,
    CategorizableTypeToViewModel,
    ICategorizableIndexQueryResult,
} from '@coscrad/api-interfaces';

export type CategorizableIndexPresenter<T extends CategorizableType> = (
    indexResult: ICategorizableIndexQueryResult<CategorizableTypeToViewModel[T]>
) => JSX.Element;

export interface CategorizableIndexPresenterFactory {
    (categorizableType: CategorizableType): CategorizableIndexPresenter<typeof categorizableType>;
}
