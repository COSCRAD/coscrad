import { DTO } from '../../../../types/DTO';
import { resourceTypes } from '../../../types/resourceTypes';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/IBibliographicReference';
import JournalArticleBibliographicReferenceData from './JournalArticleBibliographicReferenceData';

export class JournalArticleBibliographicReference
    extends Resource
    implements IBibliographicReference<JournalArticleBibliographicReferenceData>
{
    readonly type = resourceTypes.bibliographicReference;

    readonly data: JournalArticleBibliographicReferenceData;

    constructor(dto: DTO<JournalArticleBibliographicReference>) {
        super({ ...dto, type: resourceTypes.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.type = dto.type;

        this.data = new JournalArticleBibliographicReferenceData(dto.data);
    }
}
