import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import bookValidator from '../../../domainModelValidators/bookValidator';
import PageRangeContextHasSuperfluousPageIdentifiersError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pageRangeContext/PageRangeContextHasSuperfluousPageIdentifiersError';
import { Valid } from '../../../domainModelValidators/Valid';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { PageRangeContext } from '../../context/page-range-context/page-range.context.entity';
import { Resource } from '../../resource.entity';
import BookPage from './BookPage';

@RegisterIndexScopedCommands([])
export class Book extends Resource {
    readonly type = ResourceType.book;

    readonly title: string;

    readonly subtitle?: string;

    // TODO Use `contributorID` instead
    readonly author: string;

    // TODO Determine a publication model
    readonly publicationDate?: string;

    pages: BookPage[];

    constructor(dto: DTO<Book>) {
        super({ ...dto, type: ResourceType.book });

        const { title, subtitle, author, publicationDate, pages: pageDTOs } = dto;

        this.title = title;

        this.subtitle = subtitle;

        this.author = author;

        this.publicationDate = publicationDate;

        // TODO remove all casts like this
        this.pages = pageDTOs.map((pageDTO) => new BookPage(pageDTO));
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return bookValidator(this);
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

    getAvailableCommands(): string[] {
        return [];
    }
}
