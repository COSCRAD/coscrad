import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const BibliographicReferenceDetailContainer = (): JSX.Element =>
    AggregatePage(ResourceType.bibliographicReference);
