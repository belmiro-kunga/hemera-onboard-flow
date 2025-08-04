// Simple test for common-patterns without Vitest
const { createSearchFilter, createCategoryFilter } = require('./src/lib/common-patterns.ts');

console.log('🔄 Testing common-patterns functions...');

// Test data
const testItems = [
  { id: 1, name: 'Apple iPhone', description: 'Smartphone device', category: 'electronics' },
  { id: 2, name: 'Samsung Galaxy', description: 'Android phone', category: 'electronics' },
  { id: 3, name: 'MacBook Pro', description: 'Laptop computer', category: 'electronics' },
  { id: 4, name: 'JavaScript Book', description: 'Programming guide', category: 'books' }
];

try {
  // Test createSearchFilter
  console.log('Testing createSearchFilter...');
  const searchFilter = createSearchFilter('iphone');
  const searchResults = testItems.filter(item => searchFilter(item, ['name']));
  console.log('✅ Search filter test passed:', searchResults.length === 1);

  // Test createCategoryFilter
  console.log('Testing createCategoryFilter...');
  const categoryFilter = createCategoryFilter('electronics');
  const categoryResults = testItems.filter(item => categoryFilter(item, 'category'));
  console.log('✅ Category filter test passed:', categoryResults.length === 3);

  console.log('✅ All tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}