import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import InvalidEntityDTOError from '../../../domainModelValidators/errors/InvalidEntityDTOError';
import validateSimpleInvariants from '../../../domainModelValidators/utilities/validateSimpleInvariants';
import { Valid } from '../../../domainModelValidators/Valid';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/IBibliographicReference';
import JournalArticleBibliographicReferenceData from './JournalArticleBibliographicReferenceData';

export class JournalArticleBibliographicReference
    extends Resource
    implements IBibliographicReference<JournalArticleBibliographicReferenceData>
{
    readonly type = ResourceType.bibliographicReference;

    readonly data: JournalArticleBibliographicReferenceData;

    constructor(dto: DTO<JournalArticleBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.data = new JournalArticleBibliographicReferenceData(dto.data);
    }

    validateInvariants(): ResultOrError<Valid> {
        const typeErrors = validateSimpleInvariants(JournalArticleBibliographicReference, this);

        if (typeErrors.length > 0) return new InvalidEntityDTOError(this.type, this.id, typeErrors);

        return Valid;
    }

    getAvailableCommands(): string[] {
        return [];
    }
}
