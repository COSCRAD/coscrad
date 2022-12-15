export type AuthenticatedUserInfo = {
    /**
     * Note that the actual user (profile, etc.) is derived
     * state and should be accessed by joining in data from
     * the user slice on the `userId` from the auth provider.
     */
    userId: string;
    token: string;
};
