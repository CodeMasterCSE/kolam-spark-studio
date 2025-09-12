export const applyFractalSymmetry = (nlink: number[][], limit: number) => {
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      if (Math.random() > limit) {
        let fi = i;
        let fj = j;
        let fractalValue = 1;
        while (fi > 0 && fj > 0) {
          if (fi % 2 === 1 && fj % 2 === 1) {
            fractalValue = 0;
            break;
          }
          fi = Math.floor(fi / 2);
          fj = Math.floor(fj / 2);
        }
        nlink[i][j] = fractalValue;
      } else {
        nlink[i][j] = 0;
      }
    }
  }
};

export default applyFractalSymmetry;

