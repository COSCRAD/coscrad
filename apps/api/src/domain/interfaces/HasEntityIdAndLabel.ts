import { EntityId } from '../models/types/EntityId';

export interface HasEntityIdAndLabel {
    id: EntityId;
    label: string;
}
