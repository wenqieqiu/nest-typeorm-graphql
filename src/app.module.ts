import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GoodsModule } from '@/goods/goods.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'test',
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      useNewUrlParser: true, // 使用新版mongo连接Url解析格式
      synchronize: true, //自动同步数据库生成entity
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      debug: false,
      playground: true,
    }),
    GoodsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
