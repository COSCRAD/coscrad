import { PhotographLink } from './photograph-link';

export const renderPhotographThumbnailLinkCell = (id: string, url: string) => (
    <PhotographLink id={id} url={url} />
);
