import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: [
                'http://localhost:3000',
                'https://royalglitch.netlify.app',
                ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
            ],
            credentials: true,
        },
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🎭 Royal Glitch server running on port ${port}`);
}

bootstrap();
