import { PageIdentifier } from 'apps/api/src/domain/models/book/entities/types/PageIdentifier';
import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import formatListOfPageIdentifiers from 'apps/api/src/view-models/presentation/formatListOfPageIdentifiers';
import formatResourceCompositeIdentifier from 'apps/api/src/view-models/presentation/formatResourceCompositeIdentifier';

export default class PageRangeContextHasSuperfluousPageIdentifiersError extends InternalError {
    constructor(
        pageIdentifiers: PageIdentifier[],
        resourceCompositeIdentifier: ResourceCompositeIdentifier
    ) {
        const msg = [
            `The following pages are referenced in a page range context`,
            `but do not exist in ${formatResourceCompositeIdentifier(resourceCompositeIdentifier)}`,
            formatListOfPageIdentifiers(pageIdentifiers),
        ].join('');

        super(msg);
    }
}
