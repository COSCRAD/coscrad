import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import InvalidResourceDTOError from '../../../domainModelValidators/errors/InvalidResourceDTOError';
import validateSimpleInvariants from '../../../domainModelValidators/utilities/validateSimpleInvariants';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/bibliographic-reference.interface';
import JournalArticleBibliographicReferenceData from './journal-article-bibliographic-reference-data.entity';

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

        if (typeErrors.length > 0)
            return new InvalidResourceDTOError(this.type, this.id, typeErrors);

        return Valid;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
