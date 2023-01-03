import { UUID } from '@coscrad/data-types';
import { Equals } from '@coscrad/validation';
import { AggregateType } from '../../../../types/AggregateType';

export class UserCompositeIdentifier {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.user)
    type = AggregateType.user;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}