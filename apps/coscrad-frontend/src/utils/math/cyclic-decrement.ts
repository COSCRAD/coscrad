export const cyclicDecrement = (currentIndex: number, numberOfItems: number): number => {
    const newIndex = currentIndex - 1;

    // The max index is one less than the number of items (start at 0)
    if (newIndex === -1) return numberOfItems - 1;

    return newIndex;
};
