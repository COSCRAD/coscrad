import { NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../../resource.entity';
import { IBibliographicReference } from '../../interfaces/bibliographic-reference.interface';
import { BibliographicReferenceUnionMember } from '../../shared';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';
import JournalArticleBibliographicReferenceData from './journal-article-bibliographic-reference-data.entity';

@BibliographicReferenceUnionMember(BibliographicReferenceType.journalArticle)
@RegisterIndexScopedCommands(['CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_REFERENCE'])
export class JournalArticleBibliographicReference
    extends Resource
    implements IBibliographicReference<JournalArticleBibliographicReferenceData>
{
    readonly type = ResourceType.bibliographicReference;

    @NestedDataType(JournalArticleBibliographicReferenceData, {
        label: 'reference data',
        description: 'citation information for the referenced journal article',
    })
    readonly data: JournalArticleBibliographicReferenceData;

    constructor(dto: DTO<JournalArticleBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.data = new JournalArticleBibliographicReferenceData(dto.data);
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.data.title);
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
