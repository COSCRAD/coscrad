import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/bibliographic-reference.interface';
import BookBibliographicReferenceData from './book-bibliographic-reference-data.entity';
@RegisterIndexScopedCommands([])
export class BookBibliographicReference
    extends Resource
    implements IBibliographicReference<BookBibliographicReferenceData>
{
    readonly type = ResourceType.bibliographicReference;

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
