import { isNonEmptyString } from '@coscrad/validation-constraints';
import { AggregateType } from '../../domain/types/AggregateType';
import { ResourceType } from '../../domain/types/ResourceType';

type AggregateTypeAndLabel = {
    [K in AggregateType]: string;
};

// I wonder if we could make this a static property on the class?
const resourceTypeAndLabel: AggregateTypeAndLabel = {
    [AggregateType.note]: 'Note',
    [AggregateType.category]: 'Category',
    [AggregateType.tag]: 'Tag',
    [AggregateType.user]: 'User',
    [AggregateType.contributor]: 'Contributor',
    [AggregateType.userGroup]: 'User Group',
    [ResourceType.bibliographicCitation]: 'Bibliographic Citation',
    [ResourceType.digitalText]: 'Digital Text',
    [ResourceType.mediaItem]: 'Media Item',
    [ResourceType.photograph]: 'Photograph',
    [ResourceType.song]: 'Song',
    [ResourceType.spatialFeature]: 'Spatial Feature',
    [ResourceType.term]: 'Term',
    [ResourceType.audioItem]: 'Transcribed Audio Item',
    [ResourceType.video]: 'Video',
    [ResourceType.vocabularyList]: 'Vocabulary List',
    [ResourceType.playlist]: 'Playlist',
};

/**
 * Note that we have expanded the type here from `AggregateType` to string. We
 * are phasing out lookup tables in favor of dynamic registration here. Also, we
 * want to be robust to unknown `aggregateType`s in general for flexibility
 * and easy testing (without casting).
 */
export default (aggregateType: string): string => {
    const label = resourceTypeAndLabel[aggregateType];

    if (!isNonEmptyString(label)) {
        /**
         * Note that we used to throw in this case. But we want to leave
         * aggregate types dynamic to avoid strongly coupling tests for
         * generic commands and events to the concrete domain. This is especially
         * important when it comes to avoiding the use of `ResourceType` here.
         */
        return aggregateType;
    }

    return label;
};
