import { NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../../resource.entity';
import { IBibliographicReference } from '../../interfaces/bibliographic-reference.interface';
import BookBibliographicReferenceData from '../entities/book-bibliographic-reference-data.entity';

// TODO Make sure the decorator breaks if there is no such command or else use enum
@RegisterIndexScopedCommands(['CREATE_BOOK_BIBLIOGRAPHIC_REFERENCE'])
export class BookBibliographicReference
    extends Resource
    implements IBibliographicReference<BookBibliographicReferenceData>
{
    readonly type = ResourceType.bibliographicReference;

    @NestedDataType(BookBibliographicReferenceData, {
        label: 'reference data',
        description: 'citation information for the referenced book',
    })
    readonly data: BookBibliographicReferenceData;

    constructor(dto: DTO<BookBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.data = new BookBibliographicReferenceData(dto.data);
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
