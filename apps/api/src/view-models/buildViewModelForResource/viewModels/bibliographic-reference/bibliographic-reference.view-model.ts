import {
    IBibliographicReferenceData,
    IBibliographicReferenceViewModel,
} from '@coscrad/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicReference } from '../../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceDataUnion } from '../../../../domain/models/bibliographic-reference/shared/bibliographic-reference-union-data-member.decorator';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../base.view-model';

export class BibliographicReferenceViewModel
    extends BaseViewModel
    implements IBibliographicReferenceViewModel
{
    // TODO expose data types to swagger
    @ApiProperty()
    @BibliographicReferenceDataUnion({
        label: 'reference data',
        description: 'citation information for this bibliographic reference',
    })
    readonly data: IBibliographicReferenceData;

    constructor(bibliographicReference: IBibliographicReference) {
        super(bibliographicReference);

        const { data } = bibliographicReference;

        this.data = cloneToPlainObject(data);
    }
}
