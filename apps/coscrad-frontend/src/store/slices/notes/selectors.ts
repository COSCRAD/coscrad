import {
    CompositeIdentifier,
    EdgeConnectionContextType,
    EdgeConnectionType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { RootState } from '../..';
import { NOTES } from './constants';

export const selectLoadableNotes = (state: RootState) => state[NOTES];

export const selectLoadableAnnotationsForAudioVisualItem = (
    state: RootState,
    audioVisualCompositeIdentifier: CompositeIdentifier<'audioItem' | 'video'>
) => {
    const { isLoading, errorInfo, data: allNotes } = selectLoadableNotes(state);

    const data = isNullOrUndefined(allNotes)
        ? allNotes
        : allNotes.entities.filter(({ connectionType, connectedResources }) => {
              console.log('filtering notes');

              const { context, compositeIdentifier } = connectedResources[0];

              const doesMatch =
                  connectionType === EdgeConnectionType.self &&
                  context.type === EdgeConnectionContextType.timeRange &&
                  compositeIdentifier.id === audioVisualCompositeIdentifier.id &&
                  compositeIdentifier.type === audioVisualCompositeIdentifier.type;

              return doesMatch;
          });

    console.log({ allNotes, data });

    return {
        isLoading,
        errorInfo,
        data,
    };
};
