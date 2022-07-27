import { NonEmptyString, URL } from '@coscrad/data-types';
import { ValidateNested } from '@coscrad/validation';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import BibliographicReferenceCreator from '../common/bibliographic-reference-creator.entity';
import { IBibliographicReferenceData } from '../interfaces/bibliographic-reference-data.interface';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';

export class CourtCaseBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.courtCase;

    @NonEmptyString()
    readonly caseName: string;

    // TODO Link isOptional with allowing a non-empty array
    @ValidateNested()
    readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({ isOptional: true })
    readonly abstract?: string;

    @NonEmptyString({ isOptional: true })
    readonly dateDecided?: string;

    @NonEmptyString({ isOptional: true })
    readonly court?: string;

    @URL({ isOptional: true })
    readonly url?: string;

    @NonEmptyString({ isOptional: true })
    readonly pages?: string;

    constructor(dto: DTO<CourtCaseBibliographicReferenceData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        const { caseName, creators, abstract, dateDecided, court, url, pages } = dto;

        this.caseName = caseName;

        this.creators = Array.isArray(creators)
            ? creators.map((dto) => new BibliographicReferenceCreator(dto))
            : undefined;

        this.abstract = abstract;

        this.dateDecided = dateDecided;

        this.court = court;

        this.url = url;

        this.pages = pages;
    }
}
