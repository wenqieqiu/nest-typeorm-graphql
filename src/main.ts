import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('服务已启动在http://localhost:3000');
  console.log('GraphQL Playground 已启动在http://localhost:3000/graphql');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
