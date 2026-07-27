export const cyclicIncrement = (currentIndex: number, numberOfItems: number): number => {
    // If the index hits the number of items (length of array), roll back to 0
    return (currentIndex + 1) % numberOfItems;
};
