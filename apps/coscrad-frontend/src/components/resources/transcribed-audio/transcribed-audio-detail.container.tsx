import { useLoadableTranscribedAudioItemById } from '../../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-item-by-id';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { TranscribedAudioDetailPresenter } from './transcribed-audio-detail.presenter';

export const TranscribedAudioDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableTranscribedAudioItemById}
        DetailPresenter={TranscribedAudioDetailPresenter}
    />
);
