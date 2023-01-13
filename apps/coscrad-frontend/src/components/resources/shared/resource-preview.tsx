import { AggregateType } from '@coscrad/api-interfaces';

interface ResourcePreviewProps {
    resourceType: AggregateType;
}

const mediaUrl = 'https://kaaltsidakah.net/coscrad/resource-icons';
const iconDimension = '80px';

export const ResourcePreview = (props: ResourcePreviewProps): JSX.Element => (
    <img
        style={{ width: iconDimension, height: iconDimension }}
        src={`${mediaUrl}/${props.resourceType}-preview-icon.png`}
        alt={props.resourceType}
    />
);
