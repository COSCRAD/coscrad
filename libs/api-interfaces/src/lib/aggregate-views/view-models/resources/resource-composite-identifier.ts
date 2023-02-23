import { CompositeIdentifier } from '../composite-identifier.interface';
import { ResourceType } from './resource-type.enum';

export type ResourceCompositeIdentifier<TAllowedTypes extends ResourceType = ResourceType> =
    CompositeIdentifier<TAllowedTypes>;
