import { PageIdentifier } from '../../domain/models/book/entities/types/PageIdentifier';

export default (pageIdentifiers: PageIdentifier[]): string =>
    pageIdentifiers
        .reduce((accumulatedList, pageId) => accumulatedList.concat(pageId, ','), '')
        // remove trailing comma
        .slice(0, -1);
