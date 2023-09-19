import * as https from 'https';

describe(`supertest`, () => {
    const baseUrl = `https://coscradapi.tsilhqotinlanguage.ca`;

    const message = 'Welcome to the COSCRAD API!';

    Array(1)
        .fill('')
        .forEach((_, index) => {
            it(`RUN # ${index} should not leak memory`, async () => {
                const request = new Promise((resolve, reject) => {
                    https
                        .get(`${baseUrl}/api`, (response) => {
                            let data = '';

                            response.on('data', (chunk) => {
                                data += chunk;
                            });

                            response.on('end', () => {
                                resolve(JSON.parse(data));
                            });
                        })
                        .on('error', (err) => {
                            reject(err);
                        });
                });

                const response = (await request) as { message: unknown };

                expect(response.message).toBe(message);
            });
        });
});
