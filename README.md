### 启动步骤

```bash
# 安装依赖
yarn
# 开发模式运行
yarn start:dev
# 生产模式运行
yarn start:prod
```

---

技术栈 `NestJS` + `MongoDB` + `TypeORM` + `Apollo-GraphQL`

### 第一步，项目搭建

1. #### 安装@nest/cli 脚手架用于生成项目；

```bash
npm i -g @nest/cli
```

2. #### 生成项目

```bash
nest new nest-typeorm-graphql
cd ./nest-typeorm-graphql
```

3. #### 启动项目

```bash
yarn start:dev
```

启动完成后默认地址为：[http://localhost:3000/](http://localhost:3000/)，此时应该可以看到熟悉的`Hello World!`;

---

### 第二步，连接 MongoDB 数据库

> 这里使用了 TypeORM 作为数据库实体映射工具，可以大大简化数据库连接与 CRUD 操作；</br>

- TypeORM 官方介绍与文档：[TypeORM 文档](https://typeorm.io/) (右上角可切换中文)</br>
- NestJS 框架下使用 TypeORM 指南：[@nestjs/typeorm 文档](https://docs.nestjs.com/techniques/database)

1. #### 安装依赖

   ```bash
   yarn add @nestjs/typeorm typeorm mongodb
   ```

2. #### 在`src/app.module.ts`里配置数据库连接：

   ```ts
       ... ...
       import { join } from 'path';
       import { TypeOrmModule } from '@nestjs/typeorm';

       @Module({
         imports: [
           TypeOrmModule.forRoot({
             type: 'mongodb',
             host: 'localhost',
             port: 27017,
             database: 'typeorm', // 数据库名
             entities: [join(__dirname, '**/entity/*.{ts,js}')], // 需要自动实体映射的文件路径匹配
             useNewUrlParser: true, // 使用新版mongo连接Url解析格式
             synchronize: true, // 自动同步数据库生成entity
           })
         ],
   ```

   > - 在上面的 TypeOrmModule 配置里我们设置了数据库实体映射的文件路径为`**/entity/*.{ts,js}`；
   > - 为了开发方便，设置了`synchronize: true`，使 typeorm 可以自动在 MongoDB 里生成实体类定义的`Collections`，这样就省去了我们手动建立 Collections 的操作了；

---

### 第三步，GraphQL 配置

1. #### 安装依赖

   ```bash
   yarn add @nestjs/graphql graphql-tools graphql apollo-server-express
   ```

2. #### 在`src/app.module.ts`里配置 GraphQL：

   > 在 NestJS 框架下有两种开发 GraphQL 的策略，一种是先写实体类定义的`代码先行`（[Code First](https://docs.nestjs.com/graphql/quick-start#code-first)）方式，另一种是先写`schema.gql`的`架构先行`（[Schema First](https://docs.nestjs.com/graphql/quick-start#schema-first)）方式；
   > 为了保持开发风格与思路一致，这里采用了`代码先行`的策略;

   ```ts
   import { GraphQLModule } from '@nestjs/graphql';

   @Module({
     imports: [
       GraphQLModule.forRoot({
         autoSchemaFile: './schema.gql', //代码先行(既先写实体定义)
       }),
     ],
   })
   ```

---

### 第四步，开发业务模块

> 为了快速开发，此处使用了[@nest/cli](https://docs.nestjs.com/cli/overview) 命令行工具生成代码，第一步里已经全局安装;

我们开发一个商品管理模块`Goods`作为示例：

1. #### 生成 `goods.module.ts`, [Module](https://docs.nestjs.com/modules)文件；

   ```bash
   nest generate module goods
   ```

   ##### 可以简写为 `nest g mo goods`

   > 这里要引入数据库实体类定义，否则下面的`Service`无法获取数据库`Repository`对象：

   ```ts
    import { TypeOrmModule } from '@nestjs/typeorm'
    import { Goods } from './entity/goods.entity'

    @Module({
      imports: [TypeOrmModule.forFeature([Goods])],
      ... ...
    })
   ```

2. #### 生成 `goods.service.ts`, 用于实现 resolver 的 @Query 等 GraphQL 方法的具体数据库操作；

   ```bash
   nest generate service goods
   ```

   我们需要在`GoodsService`里需要实现 CRUD 方法：

   > `this.goodsRepository`的使用方法可以参考 TypeORM 官方 [Repository 文档](https://typeorm.io/#/repository-api)

   ```ts
   import { Injectable } from '@nestjs/common';
   import { InjectRepository } from '@nestjs/typeorm';
   import { Repository } from 'typeorm';
   import { Goods } from './entity/goods.entity';

   @Injectable()
   export class GoodsService {
     constructor(
       @InjectRepository(Goods) public goodsRepository: Repository<Goods>,
     ) {}

     public findAll() {
       return this.goodsRepository.find();
     }

     public findOneById(id: string) {
       return this.goodsRepository.findOne(id);
     }

     public updateOne(goods: Partial<Goods>) {
       return this.goodsRepository.update(goods.id, goods);
     }

     public addOne(goods: Partial<Goods>) {
       return this.goodsRepository.save(goods);
     }

     public deleteOne(id: string) {
       return this.goodsRepository.delete(id);
     }
   }
   ```

3. #### 生成 `goods.resolver.ts`, 用于实现 GraphQL 的 Query、Mutation；

   ```bash
   nest generate resolver goods
   ```

   `GoodsResolver`里定义 GraphQL 的 Query 与 Mutations：

   > 具体使用参考 [NestJS Resolvers](https://docs.nestjs.com/graphql/resolvers#code-first-resolver) 文档与 [NestJS Mutations](https://docs.nestjs.com/graphql/mutations#code-first) 文档;

   ```ts
   import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
   import { GoodsService } from './goods.service';
   import {
     GoodsTypeGraphql,
     GoodsInputTypeGraphql,
     GoodsInsertTypeGraphql,
   } from './entity/goods.type-graphql';

   // 包装Promise返回,使得async/await可以更方便写成同步语法的形式
   function awaitWrap<T, U = any>(
     promise: Promise<T>,
   ): Promise<[U | null, T | null]> {
     return promise
       .then<[null, T]>((data: T) => [null, data])
       .catch<[U, null]>((err) => [err, null]);
   }

   @Resolver('Goods')
   export class GoodsResolver {
     constructor(private readonly goodsService: GoodsService) {}

     //查询所有商品
     @Query(() => [GoodsTypeGraphql])
     async getAllGoods() {
       return this.goodsService.findAll();
     }

     //查询单个商品
     @Query(() => GoodsTypeGraphql)
     async getGoods(@Args('id') id: string) {
       return this.goodsService.findOneById(id);
     }

     //新增一个商品
     @Mutation(() => GoodsTypeGraphql)
     async addOneGoods(@Args('goods') goods: GoodsInsertTypeGraphql) {
       return this.goodsService.addOne({ ...goods });
     }

     // 更新一个商品信息
     @Mutation(() => GoodsTypeGraphql)
     async updateGoods(@Args('goods') goods: GoodsInputTypeGraphql) {
       const [err] = await awaitWrap(this.goodsService.updateOne(goods));
       if (err) {
         return goods;
       }
       return this.goodsService.findOneById(goods.id);
     }

     // 删除一个商品信息
     @Mutation(() => Boolean)
     async deleteOneGoods(@Args('id') id: string) {
       const [err] = await awaitWrap(this.goodsService.deleteOne(id));
       if (err) {
         return false;
       }
       return true;
     }
   }
   ```

4. #### 生成 `goods.entity.ts`, 用于定义 TypeOrm[数据库实体类](https://typeorm.io/#/entities)定义；

   > 具体文档可查看 [NestJS Database](https://docs.nestjs.com/techniques/database)

   ```bash
   cd ./src/goods
   mkdir entity
   cd ./entity
   nest generate class goods.entity --no-spec
   ```

   实体类定义如下：

   ```ts
   import {
     Entity,
     Column,
     ObjectID,
     ObjectIdColumn,
     PrimaryGeneratedColumn,
   } from 'typeorm';

   @Entity()
   export class Goods {
     @PrimaryGeneratedColumn()
     @ObjectIdColumn()
     readonly id: ObjectID;

     @Column({ unique: true })
     readonly name: string;

     @Column()
     readonly price: number;

     @Column()
     readonly count: number;

     @Column()
     readonly remark: string;
   }
   ```

   启动服务后会自动在 MongoDB 的 typeorm 库下生成对应名称的 Collections
   ![](https://user-gold-cdn.xitu.io/2020/7/20/1736bae0b5dfb459?w=259&h=139&f=png&s=4576)

5. #### 生成 `goods.type-graphql.ts`，GraphQL 的类型定义文件；

   这里使用了[代码先行](https://docs.nestjs.com/graphql/resolvers#code-first)的策略,用于编写 GraphQL 类型定义类
   ,@nestjs/graphql 将自动生成 schema.gql；

   ```bash
   nest generate class goods.type-graphql --no-spec
   ```

   最后定义 GraphQL 类型即可：

   ```ts
   import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

   @ObjectType()
   export class GoodsTypeGraphql {
     @Field(() => ID)
     readonly id: any;
     readonly name: string;
     readonly price?: number;
     readonly count?: number;
     readonly remark?: string;
   }

   @InputType()
   export class GoodsInsertTypeGraphql {
     readonly name: string;
     readonly price?: number;
     readonly count?: number;
     readonly remark?: string;
   }

   @InputType()
   export class GoodsInputTypeGraphql {
     @Field(() => ID)
     readonly id: any;
     readonly name: string;
     readonly price?: number;
     readonly count?: number;
     readonly remark?: string;
   }
   ```

   > 这里为了减少重复代码，少写`@Field`，我们使用了`@nestjs/graphql`的 [CLI 插件](https://docs.nestjs.com/graphql/cli-plugin#cli-plugin)

   根目录下的`nest-cli.json`修改为：

   ```json
   {
     "collection": "@nestjs/schematics",
     "sourceRoot": "src",
     "compilerOptions": {
       "plugins": [
         {
           "name": "@nestjs/graphql/plugin",
           "options": {
             "typeFileNameSuffix": [".type-graphql.ts"]
           }
         }
       ]
     }
   }
   ```

   > 最终得到如下若干文件：
   > ![文件列表.png](https://user-gold-cdn.xitu.io/2020/7/20/1736b5b810ba9c9f?w=264&h=197&f=png&s=7265)

   ***

   ### 大功告成，再次启动服务

   ```bash
   yarn start:dev
   ```

   等待启动完成即可访问 [http://localhost:3000/graphql](http://localhost:3000/graphql)，打开 GraphQL Playground 愉快玩耍了；

   ![](https://user-gold-cdn.xitu.io/2020/7/20/1736bee0e14d8c70?w=1920&h=921&f=png&s=101058)

   ### 下期预告 —— Vue + TypeScript + vue-apollo-graphql
