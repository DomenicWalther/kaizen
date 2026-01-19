import { Upgrade } from './prestige.model';

export interface AlchemyUpgrade extends Upgrade {
  currencyType: AlchemyUpgradeCurrencyType;
  maximumLevel: number;
}

export enum AlchemyUpgradeCurrencyType {
  BASIC_DUST = 'basic_dust',
  IMPROVED_DUST = 'improved_dust',
  ADVANCED_DUST = 'advanced_dust',
}
