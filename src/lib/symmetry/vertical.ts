export const applyVerticalSymmetry = (nlink: number[][], limit: number) => {
  const width = nlink[0].length;
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < Math.floor(width / 2); j++) {
      const l = Math.random() > limit ? 1 : 0;
      nlink[i][j] = l;
      nlink[i][width - j - 1] = l; // mirror left-right
    }
  }
};

export default applyVerticalSymmetry;

