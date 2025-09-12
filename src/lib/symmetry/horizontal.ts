export const applyHorizontalSymmetry = (nlink: number[][], limit: number) => {
  const height = nlink.length;
  for (let i = 0; i < Math.floor(height / 2); i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      const l = Math.random() > limit ? 1 : 0;
      nlink[i][j] = l;
      nlink[height - i - 1][j] = l; // mirror top-bottom
    }
  }
};

export default applyHorizontalSymmetry;

