import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { AggregateId } from '../../../../types/AggregateId';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCompositeIdentifier } from '../create-term';

@CoscradDataExample<AddPhotograhForTerm>({
    example: {
        aggregateCompositeIdentifier: { type: AggregateType.term, id: buildDummyUuid(34) },
        photographId: buildDummyUuid(43),
    },
})
@Command({
    type: 'ADD_PHOTOGRAPH_FOR_TERM',
    label: 'add photograph for term',
    description: 'add photograph for the existing term',
})
export class AddPhotograhForTerm implements ICommandBase {
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
    readonly photographId: AggregateId;
}
