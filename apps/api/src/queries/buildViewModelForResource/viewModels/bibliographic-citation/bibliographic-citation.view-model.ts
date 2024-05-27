import {
    IBibliographicCitationData,
    IBibliographicCitationViewModel,
} from '@coscrad/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicCitation } from '../../../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { BibliographicCitationDataUnionType } from '../../../../domain/models/bibliographic-citation/shared/bibliographic-citation-union-data-member.decorator';
import { CoscradContributor } from '../../../../domain/models/user-management/contributor';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseResourceViewModel } from '../base-resource.view-model';

export class BibliographicCitationViewModel
    extends BaseResourceViewModel
    implements IBibliographicCitationViewModel
{
    // TODO expose data types to swagger
    @ApiProperty()
    @BibliographicCitationDataUnionType({
        label: 'citation data',
        description: 'citation information for this bibliographic citation',
    })
    readonly data: IBibliographicCitationData;

    constructor(bibliographicCitation: IBibliographicCitation, contributors: CoscradContributor[]) {
        super(bibliographicCitation, contributors);

        const { data } = bibliographicCitation;

        this.data = cloneToPlainObject(data);
    }
}
