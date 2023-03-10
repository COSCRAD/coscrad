import type * as CSS from 'csstype';

interface FullImageViewProps {
    imageUrl: string;
    alt: string;
}

export const FullImageView = ({ imageUrl, alt }: FullImageViewProps): JSX.Element => {
    const imgStyle: CSS.Properties = {
        width: '100%',
        height: 'auto',
        maxHeight: '60vh',
        display: 'block',
        marginBottom: '2%',
        objectFit: 'cover',
    };

    return <img style={imgStyle} src={imageUrl} alt={alt} />;
};
