import applyEightWaySymmetry from './eightWay';
import applyFourWaySymmetry from './fourWay';
import applyRecursiveSymmetry from './recursive';
import applyFractalSymmetry from './fractal';
import applyVerticalSymmetry from './vertical';
import applyHorizontalSymmetry from './horizontal';
import applyDiagonalSymmetry from './diagonal';

export type SymmetryType = '8way' | '4way' | 'recursive' | 'fractal' | 'vertical' | 'horizontal' | 'diagonal';

export const symmetryStrategies: Record<SymmetryType, (nlink: number[][], limit: number) => void> = {
  '8way': applyEightWaySymmetry,
  '4way': applyFourWaySymmetry,
  'recursive': applyRecursiveSymmetry,
  'fractal': applyFractalSymmetry,
  // Note: Users expect "Vertical Mirror" to reflect top-bottom (across a horizontal axis),
  // and "Horizontal Mirror" to reflect left-right (across a vertical axis).
  // Therefore we intentionally map as follows:
  'vertical': applyHorizontalSymmetry,
  'horizontal': applyVerticalSymmetry,
  'diagonal': applyDiagonalSymmetry,
};

export default symmetryStrategies;

