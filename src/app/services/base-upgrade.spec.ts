import { BaseUpgradeService } from './base-upgrade';
import { Upgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';

class TestUpgradeService extends BaseUpgradeService<Upgrade> {
  protected getCurrentCurrency(): number {
    return 0;
  }

  protected spendCurrency(): void {}

  updateDatabase(): void {}
}

describe('BaseUpgradeService', () => {
  it('doubles the Overkill price after every purchase', () => {
    const service = new TestUpgradeService();
    const overkill = (currentLevel: number): Upgrade => ({
      id: 'overkill_stage',
      name: 'Overkill Protocol',
      description: '',
      baseCost: 1,
      costScaling: 2,
      effectType: UpgradeEffectType.OVERKILL_WAVE,
      effectValue: 1,
      effectScaling: UpgradeScalingType.LINEAR,
      currentLevel,
    });

    expect(service.calculateCost(overkill(0))).toBe(1);
    expect(service.calculateCost(overkill(1))).toBe(2);
    expect(service.calculateCost(overkill(2))).toBe(4);
  });
});
