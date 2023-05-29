const start = 0;
const end = 15;

export default Array.from({ length: end - start + 1 }, (_, index) => ({
  id: index + start,
  on: false,
}));
