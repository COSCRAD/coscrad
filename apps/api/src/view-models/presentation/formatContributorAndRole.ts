import { ContributorAndRole } from '../../domain/models/song/ContributorAndRole';

export default ({ contributorId, role }: ContributorAndRole): string =>
    `${contributorId} (${role})`;
