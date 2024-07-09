const { merge } = require("./mergeSort.js");

describe("merges two sorted arrays of objects in order ", function () {
  test("works", function () {
    let arr1 = [{ id: 9 }, { id: 7 }, { id: 5 }, { id: 3 }, { id: 1 }];
    let arr2 = [{ id: 8 }, { id: 6 }, { id: 4 }, { id: 2 }, { id: 0 }];
    let mergeSort = merge(arr1, arr2);
    expect(mergeSort).toEqual([
      { id: 9 },
      { id: 8 },
      { id: 7 },
      { id: 6 },
      { id: 5 },
      { id: 4 },
      { id: 3 },
      { id: 2 },
      { id: 1 },
      { id: 0 },
    ]);
  });

  test("works", function () {
    let arr1 = [{ id: 9 }, { id: 5 }, { id: 1 }];
    let arr2 = [{ id: 7 }, { id: 3 }];
    let mergeSort = merge(arr1, arr2);
    expect(mergeSort).toEqual([
      { id: 9 },
      { id: 7 },
      { id: 5 },
      { id: 3 },
      { id: 1 },
    ]);
  });
});
