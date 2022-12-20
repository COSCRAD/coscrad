import { IBookViewModel, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { BookViewModel } from '../../../view-models/buildViewModelForResource/viewModels/book.view-model';
import { Book } from '../../models/book/entities/book.entity';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class BookQueryService extends BaseQueryService<Book, IBookViewModel> {
    protected readonly type = ResourceType.book;

    buildViewModel(book: Book): IBookViewModel {
        return new BookViewModel(book);
    }

    getInfoForIndexScopedCommands(): ICommandFormAndLabels[] {
        return this.commandInfoService.getCommandInfo(Book);
    }
}
