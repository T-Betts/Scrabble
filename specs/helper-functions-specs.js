const expect = require('chai').expect;
const arraysEqual = require('../src/helper-functions.js').arraysEqual;

describe('arraysEqual', () => {
  it('should return true if two given arrays are equal', () => {
    let arr1 = [0, 1];
    let arr2 = [0, 1];
    expect(arraysEqual(arr1, arr2)).to.deep.equal(true);
  });

  it('should return false if two given arrays are not equal', () => {
    let arr1 = [0, 1];
    let arr2 = [0, '1'];
    expect(arraysEqual(arr1, arr2)).to.deep.equal(false);
  });
});