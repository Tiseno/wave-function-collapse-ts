const LEFT = 0 as const;
const UP = 1 as const;
const RIGHT = 2 as const;
const DOWN = 3 as const;
const directions = [LEFT, UP, RIGHT, DOWN] as const;
type Direction = (typeof directions)[number];

type Tile = { symbol: string; connections: [0 | 1, 0 | 1, 0 | 1, 0 | 1] };

const ve: Tile = { symbol: "│", connections: [0, 1, 0, 1] };
const ho: Tile = { symbol: "─", connections: [1, 0, 1, 0] };
const ld: Tile = { symbol: "┐", connections: [1, 0, 0, 1] };
const rd: Tile = { symbol: "┌", connections: [0, 0, 1, 1] };
const lu: Tile = { symbol: "┘", connections: [1, 1, 0, 0] };
const ru: Tile = { symbol: "└", connections: [0, 1, 1, 0] };
const hd: Tile = { symbol: "┬", connections: [1, 0, 1, 1] };
const hu: Tile = { symbol: "┴", connections: [1, 1, 1, 0] };
const vl: Tile = { symbol: "┤", connections: [1, 1, 0, 1] };
const vr: Tile = { symbol: "├", connections: [0, 1, 1, 1] };
const vh: Tile = { symbol: "┼", connections: [1, 1, 1, 1] };
const em: Tile = { symbol: " ", connections: [0, 0, 0, 0] };
const tiles = [ve, ho, ld, rd, lu, ru, hd, hu, vl, vr, vh, em] as const;

type Cell = { domain: Tile[] };

const emptyCell = () => ({
  domain: [...tiles],
});

const width = 50;
const height = 20;
const grid = Array(height)
  .fill(undefined)
  .map(() =>
    Array(width)
      .fill(undefined)
      .map(() => emptyCell()),
  );

const showCell = (cell: Cell) =>
  cell.domain.length === 1
    ? cell.domain[0].symbol
    : cell.domain.length <= 9
    ? String(cell.domain.length)
    : "?";

const connectionTo = (dir: Direction, x: number, y: number) => {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return "?";
  }
  if (grid[y][x].domain.every((tile) => tile.connections[dir] === 1)) {
    return 1;
  }
  if (grid[y][x].domain.every((tile) => tile.connections[dir] === 0)) {
    return 0;
  }
  return "?";
};

const constrainedBy = (connection: 0 | 1, constraint: 0 | 1 | "?") =>
  constraint !== "?" && connection !== constraint;

const update = (x: number, y: number) => {
  if (
    x < 0 ||
    y < 0 ||
    x >= width ||
    y >= height ||
    grid[y][x].domain.length <= 1
  ) {
    return;
  }
  const oldConstraints = [
    connectionTo(LEFT, x, y),
    connectionTo(UP, x, y),
    connectionTo(RIGHT, x, y),
    connectionTo(DOWN, x, y),
  ];

  const l = connectionTo(RIGHT, x - 1, y);
  const u = connectionTo(DOWN, x, y - 1);
  const r = connectionTo(LEFT, x + 1, y);
  const d = connectionTo(UP, x, y + 1);
  grid[y][x].domain = grid[y][x].domain.filter(
    (tile) =>
      !constrainedBy(tile.connections[LEFT], l) &&
      !constrainedBy(tile.connections[UP], u) &&
      !constrainedBy(tile.connections[RIGHT], r) &&
      !constrainedBy(tile.connections[DOWN], d),
  );

  const newConstraints = [
    connectionTo(LEFT, x, y),
    connectionTo(UP, x, y),
    connectionTo(RIGHT, x, y),
    connectionTo(DOWN, x, y),
  ];
  if (oldConstraints[LEFT] !== newConstraints[LEFT]) {
    update(x - 1, y);
  }
  if (oldConstraints[UP] !== newConstraints[UP]) {
    update(x, y - 1);
  }
  if (oldConstraints[RIGHT] !== newConstraints[RIGHT]) {
    update(x + 1, y);
  }
  if (oldConstraints[DOWN] !== newConstraints[DOWN]) {
    update(x, y + 1);
  }
};

const collapse = (x: number, y: number) => {
  const r = Math.floor(Math.random() * grid[y][x].domain.length);
  grid[y][x].domain = [grid[y][x].domain[r]];
  update(x - 1, y);
  update(x, y - 1);
  update(x + 1, y);
  update(x, y + 1);
};

const findLeastConstrained = () => {
  let found: { x: number; y: number; constraint: number } | undefined =
    undefined;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        grid[y][x].domain.length > 1 &&
        (found === undefined || grid[y][x].domain.length < found.constraint)
      ) {
        found = { x, y, constraint: grid[y][x].domain.length };
      }
    }
  }
  return found;
};

const printGrid = () =>
  grid.forEach((line) => console.log(line.map(showCell).join("")));

const delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const waveCollapse = async () => {
  let leastConstrained = findLeastConstrained();
  while (leastConstrained !== undefined) {
    collapse(leastConstrained.x, leastConstrained.y);
    leastConstrained = findLeastConstrained();
    // printGrid();
    // console.log();
    // await delay(20);
  }
  printGrid();
};

collapse(Math.floor(width / 2), Math.floor(height / 2));
waveCollapse();
