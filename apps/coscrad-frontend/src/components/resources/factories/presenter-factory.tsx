import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
    ICategorizableIndexQueryResult,
} from '@coscrad/api-interfaces';
import { ResourcePreviewImageProps } from '../../../utils/generic-components';
import { bookPresenterFactory } from './book.presenter-factory';

export interface ResourcePresenterFactory<T extends IBaseViewModel> {
    buildFullView: (viewModel: ICategorizableDetailQueryResult<T>) => JSX.Element;

    buildThumbnailView: (viewModel: ICategorizableDetailQueryResult<T>) => JSX.Element;

    buildDescription: (viewModel: ICategorizableDetailQueryResult<T>) => string;

    buildIndexTable: (viewModel: ICategorizableIndexQueryResult<T>) => JSX.Element;

    buildIcon: (props: ResourcePreviewImageProps) => JSX.Element;
}

export const presenterFactory = (
    categorizableType: CategorizableType
): ResourcePresenterFactory<IBaseViewModel> => {
    if (categorizableType === CategorizableType.book) return bookPresenterFactory;

    throw new Error(`Not Implemented`);
};
