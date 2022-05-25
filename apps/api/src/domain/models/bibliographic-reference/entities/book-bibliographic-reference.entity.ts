import { DTO } from '../../../../types/DTO';
import { resourceTypes } from '../../../types/resourceTypes';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/IBibliographicReference';
import BookBibliographicReferenceData from './BookBibliographicReferenceData';

export class BookBibliographicReference
    extends Resource
    implements IBibliographicReference<BookBibliographicReferenceData>
{
    readonly type = resourceTypes.bibliographicReference;

    readonly data: BookBibliographicReferenceData;

    constructor(dto: DTO<BookBibliographicReference>) {
        super({ ...dto, type: resourceTypes.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.data = new BookBibliographicReferenceData(dto.data);
    }
}
