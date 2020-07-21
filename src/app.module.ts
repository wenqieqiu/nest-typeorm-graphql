import { join } from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { GoodsModule } from './goods/goods.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'typeorm',
      entities: [join(__dirname, '**/entity/*.{ts,js}')],
      useNewUrlParser: true, // 使用新版mongo连接Url解析格式
      synchronize: true, //自动同步数据库生成entity
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: './schema.gql', //代码先行(既先写实体定义)
    }),
    GoodsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
