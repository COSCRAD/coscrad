import { AggregateType } from '@coscrad/api-interfaces';
import { ExternalEnum, UUID } from '@coscrad/data-types';

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
    @ExternalEnum(
        {
            enumLabel: 'type',
            enumName: 'type',
            labelsAndValues: [
                {
                    label: 'tag',
                    value: AggregateType.tag,
                },
            ],
        },
        {
            label: 'type',
            description: 'type',
        }
    )
    type = AggregateType.tag;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
