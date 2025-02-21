import { Controller, Sse } from '@nestjs/common';
import { merge, Observable } from 'rxjs';
import { PhotographQueryService } from '../../../domain/services/query-services/photograph-query.service';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';

@Controller('notifications')
export class ResourceUpdateNotificationsController {
    constructor(
        private readonly vocabularyListQueryService: VocabularyListQueryService,
        private readonly termQueryService: TermQueryService,
        private readonly photographQueryService: PhotographQueryService
    ) {}

    /**
     * TODO We want to move to a web sockets implementation. Right now, we just
     * stream out the view type when any document is updated. But we want to include
     * an ID, which should not be sent over public channels.
     */
    @Sse('resourceUpdates')
    public subscribeToWriteNotifications(): Observable<{ data: { type: string } }> {
        return merge(
            this.vocabularyListQueryService.subscribeToWriteNotifications(),
            this.termQueryService.subscribeToWriteNotifications(),
            this.photographQueryService.subscribeToWriteNotifications()
        );
    }
}
