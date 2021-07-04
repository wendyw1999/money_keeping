import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Item {
  readonly id: string;
  readonly title: string;
  readonly amount: number;
  readonly color?: string;
  readonly createdAt?: string;
  readonly category?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Item>);
  static copyOf(source: Item, mutator: (draft: MutableModel<Item>) => MutableModel<Item> | void): Item;
}