import { NestedDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { ResourceCompositeIdentifier } from '../../../context/commands';
import { Resource } from '../../../resource.entity';
import { registerDigitalRepresentationForBibliographicCitation } from '../../common/methods/register-digital-representation-for-bibliographic-citation';
import { IBibliographicCitation } from '../../interfaces/bibliographic-citation.interface';
import { BibliographicCitationUnionMember } from '../../shared';
import { BibliographicCitationType } from '../../types/bibliogrpahic-citation-type';
import JournalArticleBibliographicCitationData from './journal-article-bibliographic-citation-data.entity';

@BibliographicCitationUnionMember(BibliographicCitationType.journalArticle)
@RegisterIndexScopedCommands(['CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION'])
export class JournalArticleBibliographicCitation
    extends Resource
    implements IBibliographicCitation<JournalArticleBibliographicCitationData>
{
    readonly type = ResourceType.bibliographicCitation;

    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(JournalArticleBibliographicCitationData, {
        label: 'reference data',
        description: 'citation information for the referenced journal article',
    })
    readonly data: JournalArticleBibliographicCitationData;

    constructor(dto: DTO<JournalArticleBibliographicCitation>) {
        super({ ...dto, type: ResourceType.bibliographicCitation });

        if (isNullOrUndefined(dto)) return;

        const { digitalRepresentationResourceCompositeIdentifier } = dto;

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;

        this.data = new JournalArticleBibliographicCitationData(dto.data);
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.data.title);
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        return registerDigitalRepresentationForBibliographicCitation(this, compositeIdentifier);
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
