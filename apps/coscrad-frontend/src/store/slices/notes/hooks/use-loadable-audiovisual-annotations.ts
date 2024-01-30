import { CompositeIdentifier } from '@coscrad/api-interfaces';
import { RootState } from '../../..';
import { useLoadable } from '../../resources/shared/hooks';
import { selectLoadableAnnotationsForAudioVisualItem } from '../selectors';
import { fetchNotes } from '../thunks';

export const useLoadableAudioVisualAnnotations = (
    audioVisualCompositeIdentifier: CompositeIdentifier<'audioItem' | 'video'>
) =>
    useLoadable({
        selector: (state: RootState) =>
            selectLoadableAnnotationsForAudioVisualItem(state, audioVisualCompositeIdentifier),
        fetchThunk: fetchNotes,
    });
