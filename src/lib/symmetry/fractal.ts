export const applyFractalSymmetry = (nlink: number[][], limit: number) => {
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      if (Math.random() > limit) {
        nlink[i][j] = 1;
      } else {
        nlink[i][j] = 0;
      }
    }
  }
};

export default applyFractalSymmetry;
