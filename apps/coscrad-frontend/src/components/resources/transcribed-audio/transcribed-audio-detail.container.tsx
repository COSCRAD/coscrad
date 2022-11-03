import { useLoadableTranscribedAudioItemByIdFromLocation } from '../../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-item-by-id';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { TranscribedAudioDetailPresenter } from './transcribed-audio-detail.presenter';

export const TranscribedAudioDetailContainer = (): JSX.Element => {
    const loadableSearchResult = useLoadableTranscribedAudioItemByIdFromLocation();

    const Presenter = displayLoadableSearchResult(TranscribedAudioDetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
