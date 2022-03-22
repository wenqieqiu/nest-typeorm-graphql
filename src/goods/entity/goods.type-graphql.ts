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
