import { Command } from '@coscrad/commands';
import { CONNECT_RESOURCES_WITH_NOTE } from './constants';

@Command({
    type: CONNECT_RESOURCES_WITH_NOTE,
    description: 'connects two resources with a note and context',
    label: 'Connect Resources with Note',
})
export class ConnectResourcesWithNote {}
