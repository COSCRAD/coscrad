import {
    IBibliographicReferenceData,
    IBibliographicReferenceViewModel,
} from '@coscrad/api-interfaces';
import { Union2 } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicReference } from '../../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../base.view-model';

export const BIBLIOGRAPHIC_REFERENCE_DATA_UNION = `BIBLIOGRAPHIC_REFERENCE_DATA_UNION`;

export const BibliographicReferenceDataUnion = ({
    label,
    description,
}: {
    label: string;
    description: string;
}) => Union2(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, 'type', { label, description });

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
