import { UnionMember } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import { DTO } from '../../../../types/DTO';
import { PageIdentifier } from '../../book/entities/types/PageIdentifier';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EMPTY_DTO_INJECTION_TOKEN } from '../free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.pageRange)
export class PageRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.pageRange;

    readonly pageIdentifiers: PageIdentifier[];

    constructor(@Inject(EMPTY_DTO_INJECTION_TOKEN) dto: DTO<PageRangeContext>) {
        super();

        if (!dto) return;

        const { pageIdentifiers } = dto;

        // Update this cloning logic if `PageIdentifier` becomes a reference type
        this.pageIdentifiers = Array.isArray(pageIdentifiers) ? [...pageIdentifiers] : [];
    }
}
