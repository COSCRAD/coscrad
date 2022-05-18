import { IsStringWithNonzeroLength } from '@coscrad/validation';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { IBibliographicReferenceData } from '../interfaces/IBibliographicReferenceData';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';

export default class BookBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.book;

    @IsStringWithNonzeroLength()
    title: string;

    constructor(dto: DTO<BookBibliographicReferenceData>) {
        super();

        this.title = dto?.title;
    }
}
