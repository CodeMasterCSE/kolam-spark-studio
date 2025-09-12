export const applyDiagonalSymmetry = (nlink: number[][], limit: number) => {
  // Mirror across main diagonal and anti-diagonal
  const height = nlink.length;
  const width = nlink[0].length;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (i <= j) {
        const l = Math.random() > limit ? 1 : 0;
        // main diagonal symmetry
        nlink[i][j] = l;
        nlink[j][i] = l;
        // anti-diagonal symmetry
        const ai = height - 1 - i;
        const aj = width - 1 - j;
        nlink[ai][aj] = l;
        nlink[aj][ai] = l;
      }
    }
  }
};

export default applyDiagonalSymmetry;

