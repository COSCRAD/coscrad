import { IIndexQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { GenericIndexPresenter } from '../../../utils/generic-components/presenters/generic-index-presenter';

export const TranscribedAudioIndexPresenter = (
    indexResult: IIndexQueryResult<ITranscribedAudioViewModel>
) => (
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    <GenericIndexPresenter {...indexResult} />
);
