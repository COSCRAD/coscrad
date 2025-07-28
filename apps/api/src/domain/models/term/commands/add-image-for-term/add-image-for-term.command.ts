import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCompositeIdentifier } from '../create-term';

@CoscradDataExample<AddImageForTerm>({
    example: {
        aggregateCompositeIdentifier: { type: AggregateType.term, id: buildDummyUuid(34) },
        photograpgId: buildDummyUuid(43),
    },
})
@Command({
    type: 'ADD_IMAGE_FOR_TERM',
    label: 'add image for term',
    description: 'add image for the existing term',
})
export class AddImageForTerm implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'term composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: TermCompositeIdentifier;

    @ReferenceTo(AggregateType.photograph)
    @UUID({
        label: 'photograph ID',
        description: 'system reference for photograph',
    })
    readonly photograpgId: AggregateId;
}
