# Fenwick Tree Backend Logic

This file provides the core Fenwick Tree / Binary Indexed Tree logic and execution trace data for visualization.

File location:

```txt
src/util/FenwickTree.ts
```

---

## Important Indexing Rules

This module uses two indexing conventions.

### 1. `build(arr)` uses a normal JavaScript 0-based array

Example:

```ts
const bit = new FenwickTree(8);

bit.build([0, 0, 5, 0, 2, 4, 0, 0]);
```

This represents the original array:

```txt
Fenwick index: 1 2 3 4 5 6 7 8
value:         0 0 5 0 2 4 0 0
```

So:

```txt
arr[0] corresponds to Fenwick index 1
arr[1] corresponds to Fenwick index 2
arr[2] corresponds to Fenwick index 3
...
```

### 2. `update`, `query`, and `rangeQuery` use 1-based Fenwick indices

Examples:

```ts
bit.update(3, 5);      // add 5 to index 3
bit.query(6);          // prefix sum from index 1 to 6
bit.rangeQuery(3, 6);  // sum from index 3 to 6
```

Invalid examples:

```ts
bit.update(0, 5);      // invalid
bit.rangeQuery(0, 3);  // invalid
```

`query(0)` is valid and returns `0`, because it is useful for range query logic.

---

## Basic Usage

```ts
import { FenwickTree } from "./util/FenwickTree";

const bit = new FenwickTree(8);

bit.build([0, 0, 5, 0, 2, 4, 0, 0]);

console.log(bit.query(6));         // 11
console.log(bit.rangeQuery(4, 5)); // 2

bit.update(3, 2); // original index 3 += 2

console.log(bit.query(6)); // 13
```

---

## Core API

### `constructor(size: number)`

Creates a Fenwick Tree with the given size.

```ts
const bit = new FenwickTree(8);
```

`size` must be a positive integer.

---

### `build(arr: number[]): void`

Builds the Fenwick Tree from a normal 0-based JavaScript array.

```ts
bit.build([0, 0, 5, 0, 2, 4, 0, 0]);
```

The array length must equal the Fenwick Tree size.

Valid example:

```ts
const bit = new FenwickTree(8);
bit.build([0, 0, 5, 0, 2, 4, 0, 0]);
```

Invalid example:

```ts
const bit = new FenwickTree(8);
bit.build([1, 2, 3]); // invalid length
```

---

### `update(index: number, delta: number): void`

Adds `delta` to the value at `index`.

```ts
bit.update(3, 5);
```

This means:

```txt
arr[3] += 5
```

It does not set the value to `5`.

Valid index range:

```txt
1 <= index <= size
```

---

### `query(index: number): number`

Returns the prefix sum from index `1` to `index`.

```ts
bit.query(6);
```

Valid index range:

```txt
0 <= index <= size
```

`query(0)` returns `0`.

---

### `rangeQuery(left: number, right: number): number`

Returns the sum from `left` to `right`.

```ts
bit.rangeQuery(3, 6);
```

Valid range:

```txt
1 <= left <= right <= size
```

---

## Data Helper API

### `getArray(): number[]`

Returns the original array as a normal 0-based JavaScript array.

Example:

```ts
bit.build([0, 0, 5, 0, 2, 4, 0, 0]);
console.log(bit.getArray());
```

Output:

```ts
[0, 0, 5, 0, 2, 4, 0, 0]
```

---

### `getTreeArray(): number[]`

Returns the internal Fenwick Tree array.

Important: this array includes the dummy index `0`.

Example:

```ts
console.log(bit.getTreeArray());
```

Output:

```ts
[0, 0, 0, 5, 5, 2, 6, 0, 11]
```

This corresponds to:

```txt
index: 0 1 2 3 4 5 6 7 8
tree:  0 0 0 5 5 2 6 0 11
```

FE should be careful that `tree[0]` is a dummy value and is not used by the Fenwick Tree algorithm.

---

### `getCoverRange(index: number): [number, number]`

Returns the original array segment covered by `tree[index]`.

Formula:

```txt
tree[index] covers [index - lowbit(index) + 1, index]
```

Example:

```ts
bit.getCoverRange(6);
```

Output:

```ts
[5, 6]
```

Meaning:

```txt
tree[6] stores the sum of original array indices 5 to 6
```

---

### `getTreeInfo(): TreeNodeInfo[]`

Returns detailed information for each Fenwick Tree node.

Each node has:

```ts
type TreeNodeInfo = {
  index: number;
  value: number;
  coverLeft: number;
  coverRight: number;
};
```

Example item:

```ts
{
  index: 6,
  value: 6,
  coverLeft: 5,
  coverRight: 6
}
```

Meaning:

```txt
tree[6] = 6
tree[6] covers original array range [5, 6]
```

This is useful for rendering BIT blocks in React.

---

## Path Helper API

### `getUpdatePath(index: number): number[]`

Returns the Fenwick Tree nodes affected by `update(index, delta)`.

Example:

```ts
bit.getUpdatePath(3);
```

Output:

```ts
[3, 4, 8]
```

Meaning update at original index `3` will update:

```txt
tree[3], tree[4], tree[8]
```

---

### `getQueryPath(index: number): number[]`

Returns the Fenwick Tree nodes used by `query(index)`.

Example:

```ts
bit.getQueryPath(6);
```

Output:

```ts
[6, 4]
```

Meaning:

```txt
query(6) uses tree[6] and tree[4]
```

---

## Execution Trace API

The trace APIs are designed for step-by-step visualization.

### `getQueryTrace(index: number): QueryStep[]`

Returns each step of a prefix sum query.

Each step contains:

```ts
type QueryStep = {
  currentIndex: number;
  lowbit: number;
  range: [number, number];
  bitValue: number;
  partialSum: number;
};
```

Example:

```ts
bit.build([0, 0, 5, 0, 2, 4, 0, 0]);
console.log(bit.getQueryTrace(6));
```

Expected concept:

```ts
[
  {
    currentIndex: 6,
    lowbit: 2,
    range: [5, 6],
    bitValue: 6,
    partialSum: 6
  },
  {
    currentIndex: 4,
    lowbit: 4,
    range: [1, 4],
    bitValue: 5,
    partialSum: 11
  }
]
```

Meaning:

```txt
query(6)
= tree[6] + tree[4]
= sum[5..6] + sum[1..4]
= 6 + 5
= 11
```

---

### `getUpdateTrace(index: number, delta: number): UpdateStep[]`

Returns the update trace, but does not actually update the Fenwick Tree.

Each step contains:

```ts
type UpdateStep = {
  updatedIndex: number;
  affectedRange: [number, number];
  oldValue: number;
  newValue: number;
};
```

Example:

```ts
bit.build([0, 0, 5, 0, 2, 4, 0, 0]);
console.log(bit.getUpdateTrace(3, 2));
```

Expected concept:

```ts
[
  {
    updatedIndex: 3,
    affectedRange: [3, 3],
    oldValue: 5,
    newValue: 7
  },
  {
    updatedIndex: 4,
    affectedRange: [1, 4],
    oldValue: 5,
    newValue: 7
  },
  {
    updatedIndex: 8,
    affectedRange: [1, 8],
    oldValue: 11,
    newValue: 13
  }
]
```

Important:

```ts
getUpdateTrace(index, delta)
```

only generates the trace. It does not modify the tree.

---

### `updateWithTrace(index: number, delta: number): UpdateStep[]`

Generates the update trace and then actually updates the Fenwick Tree.

Example:

```ts
const trace = bit.updateWithTrace(3, 2);
```

This does:

```txt
1. Generate update trace using the old tree values
2. Apply update(3, 2)
3. Return the trace
```

Recommended for FE when the user clicks an update operation.

---

## Recommended FE Usage

### For query visualization

```ts
const trace = bit.getQueryTrace(index);
const result = bit.query(index);
```

You may also use the final `partialSum` from the last trace step.

For `query(0)`, the trace will be empty and the result is `0`.

---

### For update visualization

Recommended:

```ts
const trace = bit.updateWithTrace(index, delta);
const treeArray = bit.getTreeArray();
const originalArray = bit.getArray();
```

Do not call:

```ts
bit.update(index, delta);
const trace = bit.getUpdateTrace(index, delta);
```

because then the trace will be generated after the update, so the old/new values will be wrong.

---

## Error Handling

The backend throws errors for invalid inputs.

Examples:

```ts
new FenwickTree(0);       // invalid
bit.build([1, 2, 3]);     // invalid if size is not 3
bit.update(0, 5);         // invalid
bit.query(-1);            // invalid
bit.rangeQuery(6, 3);     // invalid
```

FE should either prevent invalid input before calling the API, or use `try...catch`.

Example:

```ts
try {
  bit.update(index, delta);
} catch (error) {
  console.error(error);
}
```

---

## Important Notes for FE

1. `build(arr)` uses normal 0-based JavaScript arrays.
2. `update`, `query`, and `rangeQuery` use 1-based Fenwick indices.
3. `update(index, delta)` means adding `delta`, not setting the value.
4. `getArray()` returns a normal 0-based original array.
5. `getTreeArray()` returns the internal BIT array and includes dummy index `0`.
6. `getUpdateTrace()` only returns trace and does not update the tree.
7. `updateWithTrace()` returns trace and also updates the tree.
8. `getQueryTrace()` is for prefix sum query visualization.
