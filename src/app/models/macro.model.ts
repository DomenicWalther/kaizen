export type MacroBlockType = 'reach-stage' | 'stage-stall' | 'ascend';

export interface ReachStageMacroBlock {
  id: string;
  type: 'reach-stage';
  targetStage: number;
}

export interface StageStallMacroBlock {
  id: string;
  type: 'stage-stall';
  seconds: number;
}

export interface AscendMacroBlock {
  id: string;
  type: 'ascend';
}

export type MacroBlock = ReachStageMacroBlock | StageStallMacroBlock | AscendMacroBlock;
