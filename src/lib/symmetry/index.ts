import applyEightWaySymmetry from './eightWay';
import applyFourWaySymmetry from './fourWay';
import applyRecursiveSymmetry from './recursive';
import applyFractalSymmetry from './fractal';
import applyFibonacciSymmetry from './fibonacci';
import applyVerticalSymmetry from './vertical';
import applyHorizontalSymmetry from './horizontal';
import applyDiagonalSymmetry from './diagonal';

export type SymmetryType = '8way' | '4way' | 'recursive' | 'fractal' | 'fibonacci' | 'vertical' | 'horizontal' | 'diagonal';

export const symmetryStrategies: Record<SymmetryType, (nlink: number[][], limit: number) => void> = {
  '8way': applyEightWaySymmetry,
  '4way': applyFourWaySymmetry,
  'recursive': applyRecursiveSymmetry,
  'fractal': applyFractalSymmetry,
  'fibonacci': applyFibonacciSymmetry,
  'vertical': applyVerticalSymmetry,
  'horizontal': applyHorizontalSymmetry,
  'diagonal': applyDiagonalSymmetry,
};

export default symmetryStrategies;

