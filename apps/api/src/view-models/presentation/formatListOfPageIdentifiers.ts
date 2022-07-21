import { PageIdentifier } from '../../domain/models/book/entities/types/PageIdentifier';
import formatArrayAsList from './shared/formatArrayAsList';

export default (pageIdentifiers: PageIdentifier[]): string => formatArrayAsList(pageIdentifiers);
