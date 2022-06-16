import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    const globalPrefix = app.get(ConfigService).get<string>('GLOBAL_PREFIX', 'api');

    app.setGlobalPrefix(globalPrefix);

    // app.enableCors({});

    const port = app.get(ConfigService).get<string>('NODE_PORT', '3987');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('COSCRAD API')
        .setDescription('Powering a Web of Knowledge')
        .setVersion('0.0')
        .addTag('coscrad')
        .addBearerAuth()
        .build();

    const documentation = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, documentation);

    await app.listen(port, () => {
        Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    });
}

bootstrap();
