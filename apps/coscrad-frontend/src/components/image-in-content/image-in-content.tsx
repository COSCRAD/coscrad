export type imageAsset = {
    src: string;
    width: number;
    height: number;
};

interface ImageInContentProps {
    image: imageAsset;
    displayWidth?: number;
    displayHeight?: number;
    alt?: string;
    alignment?: 'left' | 'right';
}

export const ImageInContent = ({
    image,
    alt,
    displayWidth,
    displayHeight,
    alignment,
}: ImageInContentProps) => {
    const { src, width, height } = image;

    const divStyle = {
        width: displayWidth,
        height: displayHeight,
    };

    const imgStyle = {
        width: '100%',
        height: 'auto',
    };

    return (
        <div style={divStyle}>
            <img style={imgStyle} src={src} alt={alt} width={width} height={height} />
        </div>
        // <Box
        //     component="img"
        //     sx={{
        //         height: { height },
        //         width: { width },
        //         maxHeight: { xs: 233, md: 167 },
        //         maxWidth: { xs: 350, md: 250 },
        //         float: { alignment },
        //     }}
        //     alt={alt}
        //     src={src}
        // />
    );
};
