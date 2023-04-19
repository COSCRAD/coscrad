import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { MultiplePropertyPresenter, PropertyLabels } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const TermDetailThumbnailPresenter = ({
    id,
    term,
    audioURL,
    ...data
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    // Temporary workaround until `name` is on IBaseViewModel
    const name = term;

    const keysAndLabels: PropertyLabels<Pick<ITermViewModel, 'termEnglish' | 'contributor'>> = {
        termEnglish: 'English',
        contributor: 'Contributor',
    };

    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.term}>
            <div data-testid={id} />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <div id="media-player">
                <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
            </div>
        </ResourceDetailThumbnailPresenter>
    );
};
