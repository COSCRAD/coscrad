import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { DTO } from '../types/DTO';
import { getCoscradDataExamples } from './utilities';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

/**
 * TODO this file is no longer needed. Remove it.
 */
const dtos: DTO<MediaItem>[] = getCoscradDataExamples(MediaItem);

export default () => dtos.map((dto) => new MediaItem(dto)).map(convertAggregatesIdToUuid);
