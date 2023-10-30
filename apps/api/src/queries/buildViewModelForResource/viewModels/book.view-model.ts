import { IBookViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Book } from '../../../domain/models/book/entities/book.entity';
import BookPage from '../../../domain/models/book/entities/BookPage';
import { BaseViewModel } from './base.view-model';

const FromBook = FromDomainModel(Book);

export class BookViewModel extends BaseViewModel implements IBookViewModel {
    @ApiProperty({
        example: 'How I won the Lottery',
        description: 'the title of the book',
    })
    @FromBook
    readonly title: string;

    @ApiPropertyOptional({
        example: "A Fool's Tale",
        description: 'subtitle of the book',
    })
    @FromBook
    readonly subtitle?: string;

    @ApiProperty({
        example: 'Susan Deer',
        description: 'the author who wrote this book',
    })
    @FromBook
    readonly author: string;

    @ApiPropertyOptional({
        example: '1998',
        description: 'the date the book was published',
    })
    @FromBook
    readonly publicationDate?: string;

    readonly pages: BookPage[];

    constructor(book: Book) {
        super(book);

        const { title, subtitle, author, publicationDate, pages } = book;

        this.title = title;

        this.subtitle = subtitle;

        this.author = author;

        this.publicationDate = publicationDate;

        // avoid shared references
        this.pages = pages.map((page) => page.clone());
    }
}
