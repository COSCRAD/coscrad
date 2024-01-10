import { PageIdentifier } from '../../domain/models/digital-text/entities';
import formatArrayAsList from './shared/formatArrayAsList';

export default (pageIdentifiers: PageIdentifier[]): string => formatArrayAsList(pageIdentifiers);
