import { IBookViewModel, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { BookViewModel } from '../../../view-models/buildViewModelForResource/viewModels/book.view-model';
import { Book } from '../../models/book/entities/book.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class BookQueryService extends ResourceQueryService<Book, IBookViewModel> {
    protected readonly type = ResourceType.book;

    buildViewModel(book: Book): IBookViewModel {
        return new BookViewModel(book);
    }

    getInfoForIndexScopedCommands(): ICommandFormAndLabels[] {
        return this.commandInfoService.getCommandInfo(Book);
    }
}
