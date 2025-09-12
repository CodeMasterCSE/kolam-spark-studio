export const applyEightWaySymmetry = (nlink: number[][], limit: number) => {
  for (let i = 0; i < nlink.length; i++) {
    for (let j = i; j < nlink[0].length / 2; j++) {
      const l = Math.random() > limit ? 1 : 0;

      nlink[i][j] = l;
      nlink[i][nlink[0].length - j - 1] = l;
      nlink[j][i] = l;
      nlink[nlink[0].length - j - 1][i] = l;
      nlink[nlink.length - 1 - i][j] = l;
      nlink[nlink.length - 1 - i][nlink[0].length - j - 1] = l;
      nlink[j][nlink.length - 1 - i] = l;
      nlink[nlink[0].length - 1 - j][nlink.length - 1 - i] = l;
    }
  }
};

export default applyEightWaySymmetry;

