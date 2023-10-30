import { isNonEmptyString } from '@coscrad/validation-constraints';
import { AggregateType } from '../../domain/types/AggregateType';
import { ResourceType } from '../../domain/types/ResourceType';
import { InternalError } from '../../lib/errors/InternalError';

type AggregateTypeAndLabel = {
    [K in AggregateType]: string;
};

// I wonder if we could make this a static property on the class?
const resourceTypeAndLabel: AggregateTypeAndLabel = {
    [AggregateType.note]: 'Note',
    [AggregateType.category]: 'Category',
    [AggregateType.tag]: 'Tag',
    [AggregateType.user]: 'User',
    [AggregateType.userGroup]: 'User Group',
    [ResourceType.bibliographicReference]: 'Bibliographic Reference',
    [ResourceType.digitalText]: 'Digital Text',
    [ResourceType.book]: 'Book',
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

export default (aggregateType: AggregateType): string => {
    const label = resourceTypeAndLabel[aggregateType];

    if (!isNonEmptyString(label)) {
        throw new InternalError(`Failed to find label for resource type: ${aggregateType}`);
    }

    return label;
};
