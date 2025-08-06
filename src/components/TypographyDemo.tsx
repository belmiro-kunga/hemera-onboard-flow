/**
 * Typography Demo Component
 * 
 * This component demonstrates the typography system integration
 * using both CSS classes and design system utilities.
 */

import React from 'react';
import { getHeadingStyle, getBodyStyle } from '../lib/design-system';

export const TypographyDemo: React.FC = () => {
  // Get styles using design system utilities
  const h1Style = getHeadingStyle('h1');
  const h2Style = getHeadingStyle('h2');
  const h3Style = getHeadingStyle('h3');
  const bodyStyle = getBodyStyle();

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="heading-1 mb-4">Typography System Demo</h1>
      <p className="body-text mb-6">
        This demo showcases the typography system integration with both CSS classes and TypeScript utilities.
      </p>

      <section className="mb-8">
        <h2 className="heading-2 mb-3">CSS Class Implementation</h2>
        <div className="space-y-4">
          <div>
            <h1 className="heading-1">Heading 1 - CSS Class</h1>
            <p className="body-text text-gray-600">24px, Bold (700), Line Height 1.2</p>
          </div>
          
          <div>
            <h2 className="heading-2">Heading 2 - CSS Class</h2>
            <p className="body-text text-gray-600">20px, Bold (700), Line Height 1.3</p>
          </div>
          
          <div>
            <h3 className="heading-3">Heading 3 - CSS Class</h3>
            <p className="body-text text-gray-600">18px, Medium (500), Line Height 1.4</p>
          </div>
          
          <div>
            <p className="body-text">Body Text - CSS Class</p>
            <p className="body-text text-gray-600">14px, Regular (400), Line Height 1.5</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="heading-2 mb-3">TypeScript Utility Implementation</h2>
        <div className="space-y-4">
          <div>
            <h1 style={h1Style}>Heading 1 - TypeScript Utility</h1>
            <p className="body-text text-gray-600">Using getHeadingStyle('h1')</p>
          </div>
          
          <div>
            <h2 style={h2Style}>Heading 2 - TypeScript Utility</h2>
            <p className="body-text text-gray-600">Using getHeadingStyle('h2')</p>
          </div>
          
          <div>
            <h3 style={h3Style}>Heading 3 - TypeScript Utility</h3>
            <p className="body-text text-gray-600">Using getHeadingStyle('h3')</p>
          </div>
          
          <div>
            <p style={bodyStyle}>Body Text - TypeScript Utility</p>
            <p className="body-text text-gray-600">Using getBodyStyle()</p>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 p-4 rounded-lg">
        <h3 className="heading-3 mb-3">Typography Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 body-text">
          <div>
            <h4 className="font-medium mb-2">Font Configuration</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>Font Family:</strong> Inter, sans-serif</li>
              <li><strong>Regular:</strong> 400</li>
              <li><strong>Medium:</strong> 500</li>
              <li><strong>Bold:</strong> 700</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Typography Scale</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>H1:</strong> 24px / 1.2 / Bold</li>
              <li><strong>H2:</strong> 20px / 1.3 / Bold</li>
              <li><strong>H3:</strong> 18px / 1.4 / Medium</li>
              <li><strong>Body:</strong> 14px / 1.5 / Regular</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TypographyDemo;