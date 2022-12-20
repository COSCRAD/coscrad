import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { TermDetailFullViewPresenter } from './term-detail.full-view.presenter';

export const TermDetailThumbnailPresenter = (
    termAndActions: ICategorizableDetailQueryResult<ITermViewModel>
): JSX.Element => (
    /**
     * For now, we will use the full-view as the thumbnail, since the full-view
     * is fairly concise to start with.
     */
    <TermDetailFullViewPresenter {...termAndActions} />
);
