import { BaseUpgradeService, createUpgradeSaveData } from './base-upgrade';
import { Upgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';

class TestUpgradeService extends BaseUpgradeService<Upgrade> {
  seed(upgrades: Upgrade[]) {
    this.upgrades.set(upgrades);
  }

  protected getCurrentCurrency(): number {
    return 0;
  }

  protected spendCurrency(): void {}

  updateDatabase(): Promise<void> {
    return Promise.resolve();
  }
}

describe('BaseUpgradeService', () => {
  it('includes new default upgrades when the database has no row for them', () => {
    const defaults = [
      { id: 'attack_speed_boost', currentLevel: 0 },
      { id: 'overkill_stage', currentLevel: 0 },
    ];
    const loadedUpgrades = [{ id: 'attack_speed_boost', currentLevel: 13 }];

    expect(createUpgradeSaveData(defaults, loadedUpgrades)).toEqual([
      { id: 'attack_speed_boost', currentLevel: 13 },
      { id: 'overkill_stage', currentLevel: 0 },
    ]);
  });

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

  it('uses cubic cost scaling for the Strength multiplier upgrade', () => {
    const service = new TestUpgradeService();
    const strengthMultiplier = (currentLevel: number): Upgrade => ({
      id: 'strength_prestige_multiplier',
      name: 'Ascendant Strength',
      description: '',
      baseCost: 1,
      costScaling: 3,
      effectType: UpgradeEffectType.STRENGTH_MULTIPLIER,
      effectValue: 0.1,
      effectScaling: UpgradeScalingType.LINEAR,
      currentLevel,
    });

    expect(service.calculateCost(strengthMultiplier(0))).toBe(1);
    expect(service.calculateCost(strengthMultiplier(1))).toBe(3);
    expect(service.calculateCost(strengthMultiplier(2))).toBe(9);
    expect(service.calculateEffect(strengthMultiplier(3))).toBeCloseTo(0.3, 12);
  });

  it('reduces the remaining effect by 5% per Fragile Foes level', () => {
    const service = new TestUpgradeService();
    const fragileFoes = (currentLevel: number): Upgrade => ({
      id: 'enemy_health_reduction',
      name: 'Fragile Foes',
      description: '',
      baseCost: 1,
      costScaling: 1.6,
      effectType: UpgradeEffectType.ENEMY_HEALTH_REDUCTION,
      effectValue: 0.05,
      effectScaling: UpgradeScalingType.DIMINISHING_RETURNS,
      currentLevel,
    });

    expect(service.calculateEffect(fragileFoes(1))).toBeCloseTo(0.05, 12);
    expect(service.calculateEffect(fragileFoes(2))).toBeCloseTo(0.0975, 12);
    expect(service.calculateEffect(fragileFoes(22))).toBeCloseTo(0.676466455026291, 12);
    expect(service.calculateEffect(fragileFoes(100))).toBeLessThan(1);
  });

  it('sets a non-negative integer level for an existing upgrade', () => {
    const service = new TestUpgradeService();
    service.seed([
      {
        id: 'overkill_stage',
        name: 'Overkill Protocol',
        description: '',
        baseCost: 1,
        costScaling: 2,
        effectType: UpgradeEffectType.OVERKILL_WAVE,
        effectValue: 1,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
    ]);

    expect(service.setUpgradeLevel('overkill_stage', 7.9)).toBeTrue();
    expect(service.getUpgradeByID('overkill_stage')?.currentLevel).toBe(7);
    expect(service.setUpgradeLevel('missing_upgrade', 5)).toBeFalse();
  });
});
