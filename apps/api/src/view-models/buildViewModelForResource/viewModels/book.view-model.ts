import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Book } from '../../../domain/models/book/entities/book.entity';
import { BaseViewModel } from './base.view-model';

const FromBook = FromDomainModel(Book);

export class BookViewModel extends BaseViewModel {
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

    // TODO Add Pages

    constructor({ id, title, subtitle, author, publicationDate }: Book) {
        super({ id });

        this.title = title;

        this.subtitle = subtitle;

        this.author = author;

        this.publicationDate = publicationDate;
    }
}
