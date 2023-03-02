interface ResourcePreviewImageProps {
    src: string;
}

export const ResourcePreviewImage = ({ src }: ResourcePreviewImageProps): JSX.Element => {
    return <img src={src} alt="Resource Preview Image" />;
};
