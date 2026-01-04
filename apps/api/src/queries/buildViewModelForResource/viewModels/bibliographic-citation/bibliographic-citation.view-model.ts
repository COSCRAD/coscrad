import { IBibliographicCitationData, ResourceType } from '@coscrad/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicCitation } from '../../../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { BibliographicCitationDataUnionType } from '../../../../domain/models/bibliographic-citation/shared/bibliographic-citation-union-data-member.decorator';
import { CoscradContributor } from '../../../../domain/models/user-management/contributor';
import { AggregateId } from '../../../../domain/types/AggregateId';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseDomainProjectionResourceViewModel } from '../base-resource.view-model';

export class BibliographicCitationViewModel extends BaseDomainProjectionResourceViewModel {
    readonly type = ResourceType.bibliographicCitation;

    @ApiProperty()
    @BibliographicCitationDataUnionType({
        label: 'citation data',
        description: 'citation information for this bibliographic citation',
    })
    readonly data: IBibliographicCitationData;

    readonly digitalRepresentationResourceCompositeIdentifier: {
        type: typeof ResourceType.digitalText;
        id: AggregateId;
    };

    constructor(bibliographicCitation: IBibliographicCitation, contributors: CoscradContributor[]) {
        super(bibliographicCitation, contributors);

        const { data, digitalRepresentationResourceCompositeIdentifier } = bibliographicCitation;

        this.data = cloneToPlainObject(data);

        if (digitalRepresentationResourceCompositeIdentifier) {
            const { type, id } = digitalRepresentationResourceCompositeIdentifier;

            if (type == ResourceType.digitalText) {
                this.digitalRepresentationResourceCompositeIdentifier = {
                    type,
                    id,
                };
            }
        }
    }
}
