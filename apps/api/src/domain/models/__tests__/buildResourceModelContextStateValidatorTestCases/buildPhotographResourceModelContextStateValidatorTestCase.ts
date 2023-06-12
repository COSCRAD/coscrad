import { ResourceType } from '../../../types/ResourceType';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.photograph);

// const validPhotograph = validCases[0].resource.clone({
//     dimensions: {
//         widthPX: 100,
//         heightPX: 100,
//     },
// });

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(ResourceType.photograph),

    // TODO Restore when supporting point context
    // {
    //     description: `the 2d point is outside the horizontal bounds of the photograph`,
    //     resource: validPhotograph,
    //     context: new PointContext({
    //         type: EdgeConnectionContextType.point2D,
    //         point: [105, 90],
    //     }),
    //     expectedError: new PointContextOutOfBoundsError(
    //         [105, 90],
    //         [
    //             [0, 100],
    //             [0, 100],
    //         ],
    //         validPhotograph.getCompositeIdentifier()
    //     ),
    // },
    // TODO Restore these when supporting FreeMultilineContext
    // {
    //     description: `the free multiline has a point that is outside the horizontal bounds of the photograph`,
    //     resource: validPhotograph,
    //     context: new FreeMultilineContext({
    //         type: EdgeConnectionContextType.freeMultiline,
    //         lines: [
    //             [
    //                 [0, 10],
    //                 [20, 30],
    //                 [200, 20],
    //             ],
    //         ],
    //     }),
    //     expectedError: new FreeMultilineContextOutOfBoundsError(
    //         validPhotograph.getCompositeIdentifier(),
    //         // Let's not worry too much about inner errors for now
    //         []
    //     ),
    // },
    // {
    //     description: `the free multiline has a multiple lines with point(s) that are outside the horizontal bounds of the photograph`,
    //     resource: validPhotograph,
    //     context: new FreeMultilineContext({
    //         type: EdgeConnectionContextType.freeMultiline,
    //         lines: [
    //             [
    //                 [10, 20],
    //                 [20, 40],
    //                 [40, 88],
    //             ],
    //             [
    //                 [0, 10],
    //                 [20, 3000],
    //                 [20, 20],
    //             ],
    //             [
    //                 [1, 2],
    //                 [2, 1],
    //             ],
    //             [
    //                 [10, 20],
    //                 [1000, 20],
    //                 [10, 2000],
    //             ],
    //         ],
    //     }),
    //     expectedError: new FreeMultilineContextOutOfBoundsError(
    //         validPhotograph.getCompositeIdentifier(),
    //         // Let's not worry too much about inner errors for now
    //         []
    //     ),
    // },
];

export default () => ({
    validCases,
    invalidCases,
});
