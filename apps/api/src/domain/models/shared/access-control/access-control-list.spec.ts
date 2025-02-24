import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { AccessControlList } from './access-control-list.entity';

const dummyIds = [
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc001',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc002',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc003',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc004',
];

describe('Access Control List', () => {
    describe('the constructor', () => {
        describe('when users and groups are specified', () => {
            const allowedUserIds = [dummyIds[0], dummyIds[1]];

            const allowedGroupIds = [dummyIds[2], dummyIds[3]];

            const acl = new AccessControlList({ allowedUserIds, allowedGroupIds });

            it('should set the allowed users', () => {
                expect(acl.allowedUserIds).toEqual(allowedUserIds);
            });

            it('should set the allowed groups', () => {
                expect(acl.allowedGroupIds).toEqual(allowedGroupIds);
            });
        });

        describe('when users are specified but groups omitted', () => {
            const allowedUserIds = [dummyIds[0], dummyIds[1]];

            const acl = new AccessControlList({ allowedUserIds });

            it('should set the allowed users', () => {
                expect(acl.allowedUserIds).toEqual(allowedUserIds);
            });

            it('should default the allowed groups to an empty array', () => {
                expect(acl.allowedGroupIds).toEqual([]);
            });
        });

        describe('when users are omitted but groups are specified', () => {
            const allowedGroupIds = [dummyIds[2], dummyIds[3]];

            const acl = new AccessControlList({ allowedGroupIds });

            it('should default the allowed users to an empty array', () => {
                expect(acl.allowedUserIds).toEqual([]);
            });

            it('should set the allowed groups', () => {
                expect(acl.allowedGroupIds).toEqual(allowedGroupIds);
            });
        });
    });

    describe('when adding users', () => {
        const userId1 = dummyIds[0];

        const userId2 = dummyIds[1];

        const acl = new AccessControlList({}).allowUser(userId1).allowUser(userId2);
        it('should allow the newly added users', () => {
            expect(acl.canUser(userId1)).toBe(true);

            expect(acl.canUser(userId2)).toBe(true);
        });

        it('should deny users that have not been added', () => {
            expect(acl.canUser(dummyIds[3])).toBe(false);
        });

        it('should not allow a user with an undefined ID', () => {
            expect(acl.canUser(undefined)).toBe(false);
        });

        it('should not allow a user with null ID', () => {
            expect(acl.canUser(null)).toBe(false);
        });
    });

    describe('when adding groups', () => {
        const groupId1 = dummyIds[3];

        const acl = new AccessControlList({}).allowGroup(groupId1);

        it('should allow the newly added group', () => {
            expect(acl.canGroup(groupId1)).toBe(true);
        });

        it('should disallow groups that have not been added', () => {
            expect(acl.canGroup(dummyIds[2])).toBe(false);
        });

        it('should not allow a group with an undefind ID', () => {
            expect(acl.canUser(undefined)).toBe(false);
        });

        it('should not allow a group with a null ID', () => {
            expect(acl.canGroup(null)).toBe(false);
        });
    });

    describe(`when the user is an admin`, () => {
        describe(`COSCRAD admin`, () => {
            describe(`when the ACL is empty`, () => {
                const acl = new AccessControlList({});

                it.only(`should allow the admin user access`, () => {
                    const result = acl.canUserWithGroups(
                        new CoscradUserWithGroups(
                            // TODO `buildDummyCoscradAdmin`
                            new CoscradUser({
                                id: buildDummyUuid(909),
                                authProviderUserId: `myauth|${1223}`,
                                // TODO Make it so this is not part of the DTO
                                type: AggregateType.user,
                                username: 'coscrad',
                                roles: [CoscradUserRole.superAdmin],
                            }),
                            []
                        )
                    );

                    expect(result).toBe(true);
                });
            });
        });

        describe(`project admin`, () => {
            describe(`when the ACL is empty`, () => {
                const acl = new AccessControlList({});

                it.only(`should allow the admin user access`, () => {
                    const result = acl.canUserWithGroups(
                        new CoscradUserWithGroups(
                            // TODO `buildDummyProjectAdmin`
                            new CoscradUser({
                                id: buildDummyUuid(909),
                                authProviderUserId: `myauth|${1223}`,
                                // TODO Make it so this is not part of the DTO
                                type: AggregateType.user,
                                username: 'project-admin',
                                roles: [CoscradUserRole.projectAdmin],
                            }),
                            []
                        )
                    );

                    expect(result).toBe(true);
                });
            });
        });
    });
});
