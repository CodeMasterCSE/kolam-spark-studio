export const applyRecursiveSymmetry = (nlink: number[][], limit: number) => {
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      if (Math.random() > limit) {
        const shouldConnect = 1;
        const scale = Math.floor(nlink.length / 3);
        nlink[i][j] = shouldConnect;
        if (i < scale && j < scale) {
          nlink[i + scale][j + scale] = shouldConnect;
          nlink[i + 2 * scale][j + 2 * scale] = shouldConnect;
        }
      } else {
        nlink[i][j] = 0;
      }
    }
  }
};

export default applyRecursiveSymmetry;

