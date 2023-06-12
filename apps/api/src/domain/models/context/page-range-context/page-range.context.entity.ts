import { FixedValue, NonEmptyString, UnionMember } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { PageIdentifier } from '../../book/entities/types/PageIdentifier';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.pageRange)
export class PageRangeContext extends EdgeConnectionContext {
    @FixedValue(
        // EdgeConnectionContextType.pageRange;
        {
            label: 'context type',
            description: `must be: ${EdgeConnectionContextType.pageRange}`,
        }
    )
    readonly type = EdgeConnectionContextType.pageRange;

    @NonEmptyString({
        isArray: true,
        label: 'page identifiers',
        description: 'a list of page identifiers relevant to this note or connection',
    })
    readonly pageIdentifiers: PageIdentifier[];

    constructor(dto: DTO<PageRangeContext>) {
        super();

        if (!dto) return;

        const { pageIdentifiers } = dto;

        // Update this cloning logic if `PageIdentifier` becomes a reference type
        this.pageIdentifiers = Array.isArray(pageIdentifiers) ? [...pageIdentifiers] : [];
    }
}
