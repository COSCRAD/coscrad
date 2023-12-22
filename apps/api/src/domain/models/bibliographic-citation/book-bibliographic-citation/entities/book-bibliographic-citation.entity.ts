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
import BookBibliographicCitationData from './book-bibliographic-citation-data.entity';

/**
 * TODO [https://www.pivotaltracker.com/story/show/183227660]
 * Make sure the decorator breaks if there is no such command or else use enum.
 */
@RegisterIndexScopedCommands(['CREATE_BOOK_BIBLIOGRAPHIC_CITATION'])
export class BookBibliographicCitation
    extends Resource
    implements IBibliographicCitation<BookBibliographicCitationData>
{
    readonly type = ResourceType.bibliographicCitation;

    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(BookBibliographicCitationData, {
        label: 'reference data',
        description: 'citation information for the referenced book',
    })
    readonly data: BookBibliographicCitationData;

    constructor(dto: DTO<BookBibliographicCitation>) {
        super({ ...dto, type: ResourceType.bibliographicCitation });

        if (isNullOrUndefined(dto)) return;

        const {
            digitalRepresentationResourceCompositeIdentifier:
                digitalRepresentationResourceCompositeIdentifier,
        } = dto;

        this.data = new BookBibliographicCitationData(dto.data);

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        return registerDigitalRepresentationForBibliographicCitation(this, compositeIdentifier);
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
