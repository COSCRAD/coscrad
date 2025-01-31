import { Controller, Sse } from '@nestjs/common';
import { interval, merge, Observable, of, throttle } from 'rxjs';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';

@Controller('notifications')
export class ResourceUpdateNotificationsController {
    constructor(
        private readonly vocabularyListQueryService: VocabularyListQueryService,
        private readonly termQueryService: TermQueryService
    ) {}

    /**
     * TODO We want to move to a web sockets implementation. Right now, we just
     * stream out the view type when any document is updated. But we want to include
     * an ID, which should not be sent over public channels.
     *
     * TODO Consolidate all notifications into a single channel.
     */
    @Sse('resourceUpdates')
    public subscribeToWriteNotifications(): Observable<{ data: { type: string } }> {
        console.log(`subsrcibing to resource updates in CONTROLLER`);

        return merge(
            this.vocabularyListQueryService.subscribeToWriteNotifications(),
            this.termQueryService.subscribeToWriteNotifications(),
            of(...'abcdefghijklmnop'.split('').map((type) => ({ data: { type } }))).pipe(
                throttle(() => interval(1500))
            )
        );
    }
}
