import {
    IBibliographicCitationData,
    IBibliographicCitationViewModel,
} from '@coscrad/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicCitation } from '../../../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { BibliographicCitationDataUnionType } from '../../../../domain/models/bibliographic-citation/shared/bibliographic-citation-union-data-member.decorator';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../base.view-model';

export class BibliographicCitationViewModel
    extends BaseViewModel
    implements IBibliographicCitationViewModel
{
    // TODO expose data types to swagger
    @ApiProperty()
    @BibliographicCitationDataUnionType({
        label: 'citation data',
        description: 'citation information for this bibliographic citation',
    })
    readonly data: IBibliographicCitationData;

    constructor(bibliographicCitation: IBibliographicCitation) {
        super(bibliographicCitation);

        const { data } = bibliographicCitation;

        this.data = cloneToPlainObject(data);
    }
}
