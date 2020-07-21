import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('服务已启动在http://localhost:3000')
  console.log('GraphQL Playground 已启动在http://localhost:3000/graphql')
}
bootstrap();

