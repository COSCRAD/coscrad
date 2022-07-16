import { isStringWithNonzeroLength } from '@coscrad/validation';
import { AggregateType } from '../../domain/types/AggregateType';
import { ResourceType } from '../../domain/types/ResourceType';
import { InternalError } from '../../lib/errors/InternalError';

type AggregateTypeAndLabel = {
    [K in AggregateType]: string;
};

const resourceTypeAndLabel: AggregateTypeAndLabel = {
    [AggregateType.note]: 'Note',
    [AggregateType.category]: 'Category',
    [AggregateType.tag]: 'Tag',
    [AggregateType.user]: 'User',
    [AggregateType.userGroup]: 'User Group',
    [ResourceType.bibliographicReference]: 'BibliographicReference',
    [ResourceType.book]: 'Book',
    [ResourceType.mediaItem]: 'Media Item',
    [ResourceType.photograph]: 'Photograph',
    [ResourceType.song]: 'Song',
    [ResourceType.spatialFeature]: 'Spatial Feature',
    [ResourceType.term]: 'Term',
    [ResourceType.transcribedAudio]: 'Transcribed Audio Item',
    [ResourceType.vocabularyList]: 'Vocabulary List',
};

export default (aggregateType: AggregateType): string => {
    const label = resourceTypeAndLabel[aggregateType];

    if (!isStringWithNonzeroLength(label)) {
        throw new InternalError(`Failed to find label for resource type: ${aggregateType}`);
    }

    return label;
};
