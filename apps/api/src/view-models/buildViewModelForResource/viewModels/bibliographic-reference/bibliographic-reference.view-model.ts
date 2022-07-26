import { ApiProperty } from '@nestjs/swagger';
import { IBibliographicReferenceData } from '../../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
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
