export const insertNumberInSequence = (arr, num) => {
    // Find the first index where the current item is greater than the value
    const index = arr.findIndex((element) => element >= num);

    // If the number already exists, do nothing
    if (index !== -1 && arr[index] === num) return arr;

    // If it belongs at the end
    if (index === -1) {
        arr.push(num);
    } else {
        // Insert at the correct sorted position
        arr.splice(index, 0, num);
    }

    return arr;
};
