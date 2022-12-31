import { IBookViewModel } from '@coscrad/api-interfaces';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { BookViewModel } from '../../../view-models/buildViewModelForResource/viewModels/book.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Book } from '../../models/book/entities/book.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class BookQueryService extends ResourceQueryService<Book, IBookViewModel> {
    protected readonly type = ResourceType.book;

    buildViewModel(book: Book): IBookViewModel {
        return new BookViewModel(book);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Book];
    }
}
