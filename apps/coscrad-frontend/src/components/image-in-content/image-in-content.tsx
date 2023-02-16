export type ImageAsset = {
    title: string;
    src: string;
    width: number;
    height: number;
};

interface ImageInContentProps {
    image: ImageAsset;
    displayWidth?: string;
    title?: string;
    alt?: string;
    alignment?: 'left' | 'right';
}

/**
 * Could add the caption feature as a part of this.  It could be optional.
 * The ImageAsset could be the model coming from the digital asset manager in the future
 * The image could have an optional borderRadius to round the corners
 * Eventually in the CMS clicking on the image could open it in full screen
 */

export const ImageInContent = ({ image, alt, displayWidth, alignment }: ImageInContentProps) => {
    const { title, src, width, height } = image;

    const divStyle = {
        width: displayWidth,
        float: alignment,
        position: 'relative',
        margin: '15px',
    } as React.CSSProperties;

    const imgStyle = {
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: '7px',
    };

    return (
        <div style={divStyle}>
            <img style={imgStyle} src={src} alt={alt} title={title} width={width} height={height} />
        </div>
    );
};
