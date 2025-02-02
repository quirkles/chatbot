import {deepMerge} from "./object"
import {describe, expect, it} from "@jest/globals";

describe('deepMerge', () => {
    it('should merge two objects with non-overlapping keys', () => {
        const target: Record<string, unknown> = { name: 'John', age: 30 };
        const source: Record<string, unknown> = { city: 'New York', country: 'USA' };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            name: 'John',
            age: 30,
            city: 'New York',
            country: 'USA'
        });
    });
    // Handle null values in source and target objects
    it('should handle null values in source and target objects', () => {
        const target = null;
        const source = { name: 'John' };

        const result = deepMerge(target, source);

        expect(result).toEqual({ name: 'John' });
    });
    // Merge two arrays by concatenating them
    it('should concatenate two arrays when both are provided', () => {
        const target = [1, 2, 3];
        const source = [4, 5, 6];

        const result = deepMerge(target, source);

        expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    // Merge nested objects recursively
    it('should merge nested objects recursively when both target and source have nested objects', () => {
        const target: any = { user: { name: 'John', address: { city: 'New York' } } };
        const source: any = { user: { age: 30, address: { country: 'USA' } } };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            user: {
                name: 'John',
                age: 30,
                address: {
                    city: 'New York',
                    country: 'USA'
                }
            }
        });
    });

    // Merge objects containing arrays as values
    it('should merge objects with arrays as values', () => {
        const target: any = { items: [1, 2, 3], name: 'List' };
        const source: any = { items: [4, 5, 6], description: 'Numbers' };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            items: [1, 2, 3, 4, 5, 6],
            name: 'List',
            description: 'Numbers'
        });
    });
})
// Merge two simple objects with non-overlapping keys
