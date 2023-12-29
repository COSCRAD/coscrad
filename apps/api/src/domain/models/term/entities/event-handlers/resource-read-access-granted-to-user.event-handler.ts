import { IUpdateEventHandler } from '../../../../../domain/common/events/build-event-handler-maps';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { Resource } from '../../../resource.entity';
import { ResourceReadAccessGrantedToUser } from '../../../shared/common-commands';

@CoscradEventHandler({
    eventType: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    scope: 'UPDATE',
})
// TODO Move this to the base aggregate directory
export class ResourceReadAccessGrantedToUserEventHandler implements IUpdateEventHandler<Resource> {
    handle(updateEvent: ResourceReadAccessGrantedToUser, resource: Resource): Resource | Error {
        const {
            payload: { userId },
        } = updateEvent;

        return resource.addEventToHistory(updateEvent).grantReadAccessToUser(userId);
    }
}
