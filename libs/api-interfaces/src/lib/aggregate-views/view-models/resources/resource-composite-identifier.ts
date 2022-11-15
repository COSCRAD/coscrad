import { ResourceType } from './resource-type.enum';

export interface ResourceCompositeIdentifier {
    type: ResourceType;
    id: string;
}
