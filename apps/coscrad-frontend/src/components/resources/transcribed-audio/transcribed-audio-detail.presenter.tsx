import { IDetailQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

export const TranscribedAudioDetailPresenter = (
    transcribedAudioItemAndActions: IDetailQueryResult<ITranscribedAudioViewModel>
): JSX.Element => GenericDetailPresenter(transcribedAudioItemAndActions);
