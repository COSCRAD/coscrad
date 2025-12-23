import { AggregateType } from '@coscrad/api-interfaces';
import { Command, ICommand } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

@CoscradDataExample<PublishEdge>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(5),
        },
    },
})
@Command({
    type: 'PUBLISH_EDGE',
    description: 'Publishes a note or connection',
    label: 'Publish Note or Connection',
})
export class PublishEdge implements ICommand {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'composite identifier',
        description:
            'a globally unique system idenetifier for the edge (note or connection) being published',
    })
    aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;
}
