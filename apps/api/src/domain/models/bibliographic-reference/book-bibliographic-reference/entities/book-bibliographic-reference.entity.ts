import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
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
import { Resource } from '../../../resource.entity';
import { IBibliographicReference } from '../../interfaces/bibliographic-reference.interface';
import BookBibliographicReferenceData from '../entities/book-bibliographic-reference-data.entity';

/**
 * TODO [https://www.pivotaltracker.com/story/show/183227660]
 * Make sure the decorator breaks if there is no such command or else use enum.
 */
@RegisterIndexScopedCommands(['CREATE_BOOK_BIBLIOGRAPHIC_REFERENCE'])
export class BookBibliographicReference
    extends Resource
    implements IBibliographicReference<BookBibliographicReferenceData>
{
    readonly type = ResourceType.bibliographicReference;

    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(BookBibliographicReferenceData, {
        label: 'reference data',
        description: 'citation information for the referenced book',
    })
    readonly data: BookBibliographicReferenceData;

    constructor(dto: DTO<BookBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        const {
            digitalRepresentationResourceCompositeIdentifier:
                digitalRepresentationResourceCompositeIdentifier,
        } = dto;

        this.data = new BookBibliographicReferenceData(dto.data);

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        // TODO Ensure that we are not overwriting this

        const updated = this.clone<BookBibliographicReference>({
            digitalRepresentationResourceCompositeIdentifier: compositeIdentifier,
        });

        return updated;
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
