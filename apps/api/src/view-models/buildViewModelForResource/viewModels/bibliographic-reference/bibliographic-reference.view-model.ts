import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicReference } from '../../../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { IBibliographicReferenceData } from '../../../../domain/models/bibliographic-reference/interfaces/IBibliographicReferenceData';
import { BaseViewModel } from '../base.view-model';

export class BibliographicReferenceViewModel extends BaseViewModel {
    @ApiProperty()
    // TODO expose data types to swagger
    readonly data: IBibliographicReferenceData;

    constructor({ id, data }: IBibliographicReference) {
        super({ id });

        this.data = data;
    }
}
