import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateType } from '../../../types/AggregateType';

export class BibliographicReferenceCompositeIdentifier {
    /**
     * This is a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @NonEmptyString({
        label: 'type',
        description:
            'sub-type of bibliographic reference (e.g., book, journal article, or court case)',
    })
    type = AggregateType.bibliographicReference;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}
