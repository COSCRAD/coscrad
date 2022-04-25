import { Position2D } from '../../domain/models/spatial-feature/types/Coordinates/Position2D';
import formatArrayAsList from './shared/formatArrayAsList';

export default (point: Position2D): string => `[${formatArrayAsList(point)}]`;
