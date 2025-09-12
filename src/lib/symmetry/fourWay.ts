export const applyFourWaySymmetry = (nlink: number[][], limit: number) => {
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length / 2; j++) {
      const l = Math.random() > limit ? 1 : 0;
      nlink[i][j] = l;
      nlink[i][nlink[0].length - j - 1] = l;
      nlink[nlink.length - i - 1][j] = l;
      nlink[nlink.length - i - 1][nlink[0].length - j - 1] = l;
    }
  }
};

export default applyFourWaySymmetry;

