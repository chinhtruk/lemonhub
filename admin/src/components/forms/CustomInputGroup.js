import React from 'react';

/**
 * CustomInputGroup - A wrapper component providing positioning for form inputs with icons
 * 
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - Child elements to render inside the input group
 * @returns {JSX.Element} - The rendered component
 */
const CustomInputGroup = ({ children }) => {
  return (
    <div className="position-relative">
      {children}
    </div>
  );
};

export default CustomInputGroup;
