import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { PageIdentifier } from '../../book/entities/types/PageIdentifier';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export class PageRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.pageRange;

    readonly pageIdentifiers: PageIdentifier[];

    constructor({ pageIdentifiers }: PartialDTO<PageRangeContext>) {
        super();

        // Update this cloning logic if `PageIdentifier` becomes a reference type
        this.pageIdentifiers = Array.isArray(pageIdentifiers) ? [...pageIdentifiers] : [];
    }
}
