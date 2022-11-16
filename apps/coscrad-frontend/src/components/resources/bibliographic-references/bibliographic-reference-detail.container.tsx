import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const BibliographicReferenceDetailContainer = (): JSX.Element =>
    ResourcePage(ResourceType.bibliographicReference);
