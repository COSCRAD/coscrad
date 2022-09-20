import { Union } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import BookBibliographicReferenceData from '../../../../domain/models/bibliographic-reference/book-bibliographic-reference/entities/book-bibliographic-reference-data.entity';
import { CourtCaseBibliographicReferenceData } from '../../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/entities/court-case-bibliographic-reference-data.entity';
import { IBibliographicReferenceData } from '../../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import JournalArticleBibliographicReferenceData from '../../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/entities/journal-article-bibliographic-reference-data.entity';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../base.view-model';

export class BibliographicReferenceViewModel extends BaseViewModel {
    // TODO expose data types to swagger
    @ApiProperty()
    @Union(
        [
            BookBibliographicReferenceData,
            CourtCaseBibliographicReferenceData,
            JournalArticleBibliographicReferenceData,
        ],
        'type'
    )
    readonly data: IBibliographicReferenceData;

    constructor({ id, data }: IBibliographicReference) {
        super({ id });

        this.data = cloneToPlainObject(data);
    }
}
