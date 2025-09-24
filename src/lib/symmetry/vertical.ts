export const applyVerticalSymmetry = (nlink: number[][], limit: number) => {
  const height = nlink.length;
  const width = nlink[0].length;

  // Mirror columns across the vertical center line (left-right symmetry)
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < Math.floor(width / 2); j++) {
      const linkValue = Math.random() > limit ? 1 : 0;
      nlink[i][j] = linkValue;
      nlink[i][width - 1 - j] = linkValue;
    }
  }

  // If there is a center column (odd number of columns), decide values for it independently
  if (width % 2 === 1) {
    const centerCol = Math.floor(width / 2);
    for (let i = 0; i < height; i++) {
      nlink[i][centerCol] = Math.random() > limit ? 1 : 0;
    }
  }
};

export default applyVerticalSymmetry;

