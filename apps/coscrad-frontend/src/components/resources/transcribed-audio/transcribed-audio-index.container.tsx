import { useLoadableTranscribedAudioItems } from '../../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-items';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { TranscribedAudioIndexPresenter } from './transcribed-audio-index.presenter';

export const TranscribedAudioIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableTranscribedAudioItems}
        IndexPresenter={TranscribedAudioIndexPresenter}
    />
);
