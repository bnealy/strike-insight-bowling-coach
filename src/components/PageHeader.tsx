
import React, { CSSProperties } from 'react';

// Helper function to add proper type assertions for CSS properties
const cssProps = <T extends Record<string, any>>(props: T): CSSProperties => props as unknown as CSSProperties;

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div style={cssProps({ textAlign: 'center', color: 'white', marginBottom: '30px' })}>
      <h1 style={cssProps({ fontSize: '2.5em', marginBottom: '10px' })}>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default PageHeader;
