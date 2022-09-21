import { EdgeConnection } from '../../../domain/models/context/edge-connection.entity';
import { DTO } from '../../../types/DTO';

/**
 * We split up seeding our test \ demonstration data for `Edge Connections` into
 * several files to make maintaining a representative set of test data easier.
 * Note that there are checks in `validateTestData.spec.ts` that will enforce
 * that we add a variety of test data for each new `ResourceType` and
 * `EdgeConnectionContextType`.
 */
export default (): DTO<EdgeConnection>[] => [];
