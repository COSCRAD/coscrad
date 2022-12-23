export const buildAuthenticationHeaders = (accessToken: string) => {
    const contentTypeHeaders = {
        'content-type': 'application/json',
    };

    if (typeof accessToken !== 'string' || accessToken.length === 0) return contentTypeHeaders;

    return {
        ...contentTypeHeaders,
        Authorization: `Bearer ${accessToken}`,
    };
};
