import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks/use-maybe-loadable-from-route-params-id';
import { useLoadableTranscribedAudioItems } from './use-loadable-transcribed-audio-items';

export const useLoadableTranscribedAudioItemByIdFromLocation = () =>
    useMaybeLoadableFromRouteParamsId(useLoadableTranscribedAudioItems);
