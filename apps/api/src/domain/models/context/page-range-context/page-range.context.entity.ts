import { DiscriminatedBy } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { PageIdentifier } from '../../book/entities/types/PageIdentifier';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@DiscriminatedBy(EdgeConnectionContextType.pageRange)
export class PageRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.pageRange;

    readonly pageIdentifiers: PageIdentifier[];

    constructor({ pageIdentifiers }: DTO<PageRangeContext>) {
        super();

        // Update this cloning logic if `PageIdentifier` becomes a reference type
        this.pageIdentifiers = Array.isArray(pageIdentifiers) ? [...pageIdentifiers] : [];
    }
}
