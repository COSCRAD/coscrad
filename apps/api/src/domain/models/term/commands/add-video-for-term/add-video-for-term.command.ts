import { AggregateType } from '@coscrad/api-interfaces';
import { Command, ICommand } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCompositeIdentifier } from '../create-term';

@CoscradDataExample<AddVideoForTerm>({
    example: {
        aggregateCompositeIdentifier: { type: AggregateType.term, id: buildDummyUuid(43) },
        videoId: buildDummyUuid(87),
    },
})
@Command({
    type: 'ADD_VIDEO_FOR_TERM',
    label: 'add video for term',
    description: 'add video for the existing term',
})
export class AddVideoForTerm implements ICommand {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'term composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: TermCompositeIdentifier;

    @ReferenceTo(AggregateType.video)
    @UUID({
        label: 'video ID',
        description: 'system reference for video',
    })
    readonly videoId: AggregateId;
}
