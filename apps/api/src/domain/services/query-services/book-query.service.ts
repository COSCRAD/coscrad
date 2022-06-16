import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { BookViewModel } from '../../../view-models/buildViewModelForResource/viewModels/book.view-model';
import { Book } from '../../models/book/entities/book.entity';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class BookQueryService extends BaseQueryService<Book, BookViewModel> {
    constructor(repositoryProvider: RepositoryProvider, commandInfoService: CommandInfoService) {
        super(ResourceType.book, repositoryProvider, commandInfoService);
    }

    buildViewModel(book: Book): BookViewModel {
        return new BookViewModel(book);
    }
    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(Book);
    }
}
