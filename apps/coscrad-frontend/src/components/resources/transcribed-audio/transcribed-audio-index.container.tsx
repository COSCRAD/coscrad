import { useLoadableTranscribedAudioItems } from '../../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-items';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { TranscribedAudioIndexPresenter } from './transcribed-audio-index.presenter';

export const TranscribedAudioIndexContainer = (): JSX.Element => {
    const loadableItems = useLoadableTranscribedAudioItems();

    const Presenter = displayLoadableWithErrorsAndLoading(TranscribedAudioIndexPresenter);

    return <Presenter {...loadableItems} />;
};
