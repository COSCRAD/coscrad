import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/page-range-context-has-superfluous-page-identifiers.error';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { PageRangeContext } from '../../context/page-range-context/page-range.context.entity';
import { Resource } from '../../resource.entity';
import BookPage from './BookPage';
import PublishedBookHasNoPagesError from './errors/PublishedBookHasNoPagesError';

const isOptional = true;
@RegisterIndexScopedCommands([])
export class Book extends Resource {
    readonly type = ResourceType.book;

    @NonEmptyString({
        label: 'title',
        description: 'title of the book (in whatever language)',
    })
    // TODO Make this property a `MultilingualText`
    readonly title: string;

    @NonEmptyString({
        isOptional,
        label: 'subtitle',
        description: 'subtitle of the book (in whatever language)',
    })
    readonly subtitle?: string;

    @NonEmptyString({
        label: 'author',
        description: 'the author of the book',
    })
    // TODO Use `contributorID` instead
    readonly author: string;

    @NonEmptyString({
        isOptional,
        label: 'publication date',
        description: 'a free form string that specifies the publication date',
    })
    // TODO Determine a publication model
    readonly publicationDate?: string;

    @NestedDataType(BookPage, {
        isArray: true,
        label: 'book pages',
        description: "a digital representation of the book's pages",
    })
    pages: BookPage[];

    constructor(dto: DTO<Book>) {
        super({ ...dto, type: ResourceType.book });

        if (!dto) return;

        const { title, subtitle, author, publicationDate, pages: pageDTOs } = dto;

        this.title = title;

        this.subtitle = subtitle;

        this.author = author;

        this.publicationDate = publicationDate;

        // TODO remove all casts like this
        this.pages = Array.isArray(pageDTOs)
            ? pageDTOs.map((pageDTO) => new BookPage(pageDTO))
            : undefined;
    }

    getName(): MultilingualText {
        // TODO make `title` `MultilingualText`
        return buildMultilingualTextWithSingleItem(this.title);
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { published, pages } = this;

        if (published && pages?.length === 0) allErrors.push(new PublishedBookHasNoPagesError()); // PublishedBookHasNoPagesError

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected validatePageRangeContext(context: PageRangeContext): Valid | InternalError {
        // TODO Is this really necessary?
        if (isNullOrUndefined(context))
            return new InternalError(`Page Range Context is undefined for book: ${this.id}`);

        // We may want to rename the pages property in the PageRangeContext
        const { pageIdentifiers: contextPageIdentifiers } = context;

        const missingPages = contextPageIdentifiers.reduce(
            (accumulatedList, contextPageIdentifier) =>
                this.pages.some(({ identifier }) => identifier === contextPageIdentifier)
                    ? accumulatedList
                    : accumulatedList.concat(contextPageIdentifier),
            []
        );

        if (missingPages.length > 0)
            return new PageRangeContextHasSuperfluousPageIdentifiersError(
                missingPages,
                this.getCompositeIdentifier()
            );

        return Valid;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
