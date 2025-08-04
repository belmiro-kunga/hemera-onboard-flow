import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSearchAndFilter, createSearchFilter, createCategoryFilter } from '@/lib/common-patterns';

describe('Common Patterns', () => {
    describe('useSearchAndFilter', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => useSearchAndFilter());

            expect(result.current.searchTerm).toBe('');
            expect(result.current.selectedCategory).toBe('all');
        });

        it('should update search term', () => {
            const { result } = renderHook(() => useSearchAndFilter());

            act(() => {
                result.current.setSearchTerm('test search');
            });

            expect(result.current.searchTerm).toBe('test search');
        });

        it('should update selected category', () => {
            const { result } = renderHook(() => useSearchAndFilter());

            act(() => {
                result.current.setSelectedCategory('category1');
            });

            expect(result.current.selectedCategory).toBe('category1');
        });
    });

    describe('createSearchFilter', () => {
        const testItems = [
            { id: 1, name: 'Apple iPhone', description: 'Smartphone device' },
            { id: 2, name: 'Samsung Galaxy', description: 'Android phone' },
            { id: 3, name: 'MacBook Pro', description: 'Laptop computer' }
        ];

        it('should filter items by search term in name', () => {
            const filter = createSearchFilter('iphone');
            const filtered = testItems.filter(item => filter(item, ['name']));

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('Apple iPhone');
        });

        it('should filter items by search term in description', () => {
            const filter = createSearchFilter('phone');
            const filtered = testItems.filter(item => filter(item, ['description']));

            expect(filtered).toHaveLength(2);
            expect(filtered.map(item => item.name)).toEqual(['Apple iPhone', 'Samsung Galaxy']);
        });

        it('should filter items by search term in multiple fields', () => {
            const filter = createSearchFilter('samsung');
            const filtered = testItems.filter(item => filter(item, ['name', 'description']));

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('Samsung Galaxy');
        });

        it('should be case insensitive', () => {
            const filter = createSearchFilter('APPLE');
            const filtered = testItems.filter(item => filter(item, ['name']));

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('Apple iPhone');
        });

        it('should return all items when search term is empty', () => {
            const filter = createSearchFilter('');
            const filtered = testItems.filter(item => filter(item, ['name']));

            expect(filtered).toHaveLength(3);
        });

        it('should return empty array when no matches found', () => {
            const filter = createSearchFilter('nonexistent');
            const filtered = testItems.filter(item => filter(item, ['name']));

            expect(filtered).toHaveLength(0);
        });
    });

    describe('createCategoryFilter', () => {
        const testItems = [
            { id: 1, category: 'electronics', name: 'iPhone' },
            { id: 2, category: 'electronics', name: 'Samsung' },
            { id: 3, category: 'books', name: 'JavaScript Guide' },
            { id: 4, category: 'clothing', name: 'T-Shirt' }
        ];

        it('should filter items by category', () => {
            const filter = createCategoryFilter('electronics');
            const filtered = testItems.filter(item => filter(item, 'category'));

            expect(filtered).toHaveLength(2);
            expect(filtered.map(item => item.name)).toEqual(['iPhone', 'Samsung']);
        });

        it('should return all items when category is "all"', () => {
            const filter = createCategoryFilter('all');
            const filtered = testItems.filter(item => filter(item, 'category'));

            expect(filtered).toHaveLength(4);
        });

        it('should return empty array when category does not exist', () => {
            const filter = createCategoryFilter('nonexistent');
            const filtered = testItems.filter(item => filter(item, 'category'));

            expect(filtered).toHaveLength(0);
        });

        it('should work with nested properties', () => {
            const nestedItems = [
                { id: 1, meta: { category: 'tech' }, name: 'Laptop' },
                { id: 2, meta: { category: 'books' }, name: 'Novel' }
            ];

            const filter = createCategoryFilter('tech');
            const filtered = nestedItems.filter(item => filter(item, 'meta.category'));

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('Laptop');
        });
    });

    describe('Integration tests', () => {
        const testData = [
            { id: 1, name: 'iPhone 15', category: 'electronics', description: 'Latest smartphone' },
            { id: 2, name: 'MacBook Air', category: 'electronics', description: 'Lightweight laptop' },
            { id: 3, name: 'JavaScript Book', category: 'books', description: 'Programming guide' },
            { id: 4, name: 'Cotton T-Shirt', category: 'clothing', description: 'Comfortable wear' }
        ];

        it('should combine search and category filters', () => {
            const searchFilter = createSearchFilter('laptop');
            const categoryFilter = createCategoryFilter('electronics');

            const filtered = testData
                .filter(item => searchFilter(item, ['name', 'description']))
                .filter(item => categoryFilter(item, 'category'));

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('MacBook Air');
        });

        it('should work with useSearchAndFilter hook', () => {
            const { result } = renderHook(() => useSearchAndFilter());

            // Set search term and category
            act(() => {
                result.current.setSearchTerm('book');
                result.current.setSelectedCategory('books');
            });

            const searchFilter = createSearchFilter(result.current.searchTerm);
            const categoryFilter = createCategoryFilter(result.current.selectedCategory);

            const filtered = testData
                .filter(item => searchFilter(item, ['name', 'description']))
                .filter(item => categoryFilter(item, 'category'));

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('JavaScript Book');
        });
    });
});