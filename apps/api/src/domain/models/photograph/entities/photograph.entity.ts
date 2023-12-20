import { MIMEType, NestedDataType, NonEmptyString, ReferenceTo } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import findAllPointsInLineNotWithinBounds from '../../../../lib/validation/geometry/findAllPointsInLineNotWithinBounds';
import isPointWithinBounds from '../../../../lib/validation/geometry/isPointWithinBounds';
import formatPosition2D from '../../../../queries/presentation/formatPosition2D';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import FreeMultilineContextOutOfBoundsError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/freeMultilineContext/FreeMultilineContextOutOfBoundsError';
import PointContextOutOfBoundsError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/pointContext/PointContextOutOfBoundsError';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import InvalidExternalReferenceByAggregateError from '../../categories/errors/InvalidExternalReferenceByAggregateError';
import { FreeMultilineContext } from '../../context/free-multiline-context/free-multiline-context.entity';
import { PointContext } from '../../context/point-context/point-context.entity';
import { Boundable2D } from '../../interfaces/Boundable2D';
import { Resource } from '../../resource.entity';
import idEquals from '../../shared/functional/idEquals';
import { Position2D } from '../../spatial-feature/types/Coordinates/Position2D';
import { InvalidMimeTypeForPhotographError } from '../errors';
import PhotographDimensions from './PhotographDimensions';

export const isMimeTypeAllowedForPhotograph = (mimeType: MIMEType): boolean =>
    [
        // TODO add jpg and bmp
        MIMEType.png,
    ].includes(mimeType);

@RegisterIndexScopedCommands([])
export class Photograph extends Resource implements Boundable2D {
    readonly type = ResourceType.photograph;

    @NestedDataType(MultilingualText, {
        label: 'title',
        description: 'multilingual title for this photograph',
    })
    readonly title: MultilingualText;

    // TODO Make this a `mediaItemId` @UUID
    @NonEmptyString({
        label: 'media item ID',
        description: 'reference to the media item for this photograph',
    })
    @ReferenceTo(AggregateType.mediaItem)
    readonly mediaItemId: AggregateId;

    // TODO make this a `contributorID`
    @NonEmptyString({
        label: 'photograph',
        description: 'the person who took the picture',
    })
    readonly photographer: string;

    @NestedDataType(PhotographDimensions, {
        label: 'dimensions',
        description: 'the height and width of the photograph in pixels',
    })
    readonly dimensions: PhotographDimensions;

    constructor(dto: DTO<Photograph>) {
        super({ ...dto, type: ResourceType.photograph });

        if (!dto) return;

        const { title, mediaItemId, photographer, dimensions: dimensionsDTO } = dto;

        this.mediaItemId = mediaItemId;

        this.photographer = photographer;

        this.dimensions = new PhotographDimensions(dimensionsDTO);

        this.title = new MultilingualText(title);
    }

    getName(): MultilingualText {
        return this.title;
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    /**
     * TODO We should remove `getExternalReferences` now that we do it using
     * the schema (defined via @ReferenceTo \ @FullReference)
     */
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    override validateExternalReferences({
        resources: { mediaItem: mediaItems },
    }: InMemorySnapshot): ValidationResult {
        /**
         * Note that typically we inject a snapshot with only the relevant
         * media item.
         */
        const myMediaItem = mediaItems.find(idEquals(this.mediaItemId));

        if (isNullOrUndefined(myMediaItem))
            return new InvalidExternalReferenceByAggregateError(this.getCompositeIdentifier(), [
                {
                    type: AggregateType.mediaItem,
                    id: this.mediaItemId,
                },
            ]);

        const { mimeType } = myMediaItem;

        if (!isMimeTypeAllowedForPhotograph(mimeType)) {
            return new InvalidMimeTypeForPhotographError(mimeType);
        }

        return Valid;
    }

    // TODO break out the validate point logic into a validation library instead
    validateFreeMultilineContext(context: FreeMultilineContext): Valid | InternalError {
        const lines = context.lines;

        const allErrors: InternalError[] = lines
            .map((line) => line.getCoordinates())
            .reduce((accumulatedErrors: InternalError[], line, index) => {
                const invalidPointsForThisLine = findAllPointsInLineNotWithinBounds(
                    line,
                    this.getGeometricBounds()
                );

                if (invalidPointsForThisLine.length > 0) {
                    const invalidPointsMessage = invalidPointsForThisLine.reduce(
                        (accumulatedMessage, { index, point }) =>
                            accumulatedMessage.concat(
                                `index: ${index},`,
                                `point: ${formatPosition2D(point)}`,
                                '\n'
                            ),
                        ''
                    );

                    // TODO: Break this out into a dedicated error
                    return accumulatedErrors.concat(
                        new InternalError(
                            `Invalid line at index: ${index} in free multiline context. \n Invalid points: ${invalidPointsMessage}`
                        )
                    );
                }

                return accumulatedErrors;
            }, []);

        if (allErrors.length > 0)
            return new FreeMultilineContextOutOfBoundsError(
                this.getCompositeIdentifier(),
                allErrors
            );

        return Valid;
    }

    validatePoint2DContext({ point }: PointContext): Valid | InternalError {
        if (!isPointWithinBounds(point, ...this.getGeometricBounds()))
            return new PointContextOutOfBoundsError(
                point,
                this.getGeometricBounds(),
                this.getCompositeIdentifier()
            );

        return Valid;
    }

    /**
     * @returns [height,width]
     */
    getGeometricBounds(): [Position2D, Position2D] {
        return [
            [0, this.dimensions.heightPX],
            [0, this.dimensions.widthPX],
        ];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
