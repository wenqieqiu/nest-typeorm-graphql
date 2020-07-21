import { Module } from '@nestjs/common'
import { GoodsService } from './goods.service'
import { GoodsResolver } from './goods.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Goods } from './entity/goods.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Goods])],
  providers: [GoodsService, GoodsResolver]
})
export class GoodsModule {}
