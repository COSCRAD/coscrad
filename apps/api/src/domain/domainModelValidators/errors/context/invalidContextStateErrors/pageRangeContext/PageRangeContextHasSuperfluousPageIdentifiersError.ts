import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import formatListOfPageIdentifiers from '../../../../../../view-models/presentation/formatListOfPageIdentifiers';
import { PageIdentifier } from '../../../../../models/book/entities/types/PageIdentifier';
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
