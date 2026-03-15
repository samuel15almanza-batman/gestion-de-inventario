import { Output } from '../models/Output';

export class OutputFactory {
  static create(data: Omit<Output, 'id' | 'fecha'>): Output {
    return {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      ...data
    };
  }
}
