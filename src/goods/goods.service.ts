import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goods } from './entity/goods.entity';

@Injectable()
export class GoodsService {
  constructor(@InjectRepository(Goods) public goodsRepository: Repository<Goods>) {}

  public findAll() {
    return this.goodsRepository.find();
  }

  public findOneById(id: any) {
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
