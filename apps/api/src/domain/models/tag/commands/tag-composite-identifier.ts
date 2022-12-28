import { AggregateType } from '@coscrad/api-interfaces';
import { UUID } from '@coscrad/data-types';
import { Equals } from '@coscrad/validation';

export class TagCompositeIdentifier {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.tag)
    type = AggregateType.tag;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
