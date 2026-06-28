export type RequestHeaders = {
    ['content-type']: string;
    Authorization?: `${'Bearer '}${string}`;
};

export const buildAuthenticationHeaders = (accessToken: string): RequestHeaders => {
    const contentTypeHeaders = {
        'content-type': 'application/json',
    };

    if (typeof accessToken !== 'string' || accessToken.length === 0) return contentTypeHeaders;

    return {
        ...contentTypeHeaders,
        Authorization: `Bearer ${accessToken}`,
    };
};
