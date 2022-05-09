import { ResourceCompositeIdentifier } from '../../domain/models/types/ResourceCompositeIdentifier';

export default ({ id, type }: ResourceCompositeIdentifier): string => `${type}/${id}`;
