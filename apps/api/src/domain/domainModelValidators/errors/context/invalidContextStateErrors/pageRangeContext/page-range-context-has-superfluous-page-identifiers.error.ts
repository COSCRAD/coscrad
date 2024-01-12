import { PageIdentifier } from '../../../../../../domain/models/digital-text/entities';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import formatListOfPageIdentifiers from '../../../../../../queries/presentation/formatListOfPageIdentifiers';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';

export default class PageRangeContextHasSuperfluousPageIdentifiersError extends InternalError {
    constructor(
        pageIdentifiers: PageIdentifier[],
        resourceCompositeIdentifier: AggregateCompositeIdentifier
    ) {
        const msg = [
            `The following pages are referenced in a page range context`,
            `but do not exist in ${formatResourceCompositeIdentifier(
                resourceCompositeIdentifier
            )}:`,
            formatListOfPageIdentifiers(pageIdentifiers),
        ].join(' ');

        super(msg);
    }
}
