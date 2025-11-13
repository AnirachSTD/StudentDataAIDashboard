import React from 'react';

export const TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 3H5a2 2 0 0 0-2 2v4h6V3z"/>
    <path d="M9 9H3v6h6V9z"/>
    <path d="M9 15H3v4a2 2 0 0 0 2 2h4v-6z"/>
    <path d="M15 3h4a2 2 0 0 1 2 2v4h-6V3z"/>
    <path d="M15 9h6v6h-6V9z"/>
    <path d="M15 15h6v4a2 2 0 0 1-2 2h-4v-6z"/>
  </svg>
);