export type MacroBlockType = 'reach-stage' | 'ascend';

export interface ReachStageMacroBlock {
  id: string;
  type: 'reach-stage';
  targetStage: number;
}

export interface AscendMacroBlock {
  id: string;
  type: 'ascend';
}

export type MacroBlock = ReachStageMacroBlock | AscendMacroBlock;
