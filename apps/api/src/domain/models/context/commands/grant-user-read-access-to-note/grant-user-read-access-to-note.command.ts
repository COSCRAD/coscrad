import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../../src/test-data/utilities';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

@CoscradDataExample<GrantUserReadAccessToNote>({
    example: {
        aggregateCompositeIdentifier: {
            type: 'note',
            id: buildDummyUuid(1),
        },
        userId: buildDummyUuid(10),
    },
})
@Command({
    type: 'GRANT_USER_READ_ACCESS_TO_NOTE',
    label: 'Grant Read Access to Note',
    description: 'Allow a user to view (but not edit) a given note',
})
export class GrantUserReadAccessToNote implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @UUID({
        label: 'userId',
        description: 'the ID of the user who will be given permission to view this note',
    })
    readonly userId: AggregateId;
}
