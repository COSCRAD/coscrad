import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatListOfPageIdentifiers from '../../../../../../view-models/presentation/formatListOfPageIdentifiers';
import formatResourceCompositeIdentifier from '../../../../../../view-models/presentation/formatResourceCompositeIdentifier';
import { PageIdentifier } from '../../../../../models/book/entities/types/PageIdentifier';
import { ResourceCompositeIdentifier } from '../../../../../models/types/ResourceCompositeIdentifier';

export default class PageRangeContextHasSuperfluousPageIdentifiersError extends InternalError {
    constructor(
        pageIdentifiers: PageIdentifier[],
        resourceCompositeIdentifier: ResourceCompositeIdentifier
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
