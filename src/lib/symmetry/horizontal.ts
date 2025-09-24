export const applyHorizontalSymmetry = (nlink: number[][], limit: number) => {
  const height = nlink.length;
  const width = nlink[0].length;

  // Mirror rows across the horizontal center line (top-bottom symmetry)
  for (let i = 0; i < Math.floor(height / 2); i++) {
    for (let j = 0; j < width; j++) {
      const linkValue = Math.random() > limit ? 1 : 0;
      nlink[i][j] = linkValue;
      nlink[height - 1 - i][j] = linkValue;
    }
  }

  // If there is a center row (odd number of rows), decide values for it independently
  if (height % 2 === 1) {
    const centerRow = Math.floor(height / 2);
    for (let j = 0; j < width; j++) {
      nlink[centerRow][j] = Math.random() > limit ? 1 : 0;
    }
  }
};

export default applyHorizontalSymmetry;

