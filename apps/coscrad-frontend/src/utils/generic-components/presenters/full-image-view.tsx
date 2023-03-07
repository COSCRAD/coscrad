interface FullImageViewProps {
    imageUrl: string;
    alt: string;
}

export const FullImageView = ({ imageUrl, alt }: FullImageViewProps): JSX.Element => {
    const imgStyle = {
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: '7px',
        marginBottom: '7px',
    };

    return <img style={imgStyle} src={imageUrl} alt={alt} />;
};
