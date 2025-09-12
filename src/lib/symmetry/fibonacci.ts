export const applyFibonacciSymmetry = (nlink: number[][], limit: number) => {
  const fib = [1, 1, 2, 3, 5, 8, 13, 21];
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      if (Math.random() > limit) {
        const fibIndex = (i + j) % fib.length;
        const fibValue = fib[fibIndex];
        const angle = (fibValue * Math.PI * 2) / 8;
        const radius = Math.sqrt(i * i + j * j);
        if (Math.floor(radius + angle) % fibValue === 0) {
          nlink[i][j] = 1;
        } else {
          nlink[i][j] = 0;
        }
      } else {
        nlink[i][j] = 0;
      }
    }
  }
};

export default applyFibonacciSymmetry;

