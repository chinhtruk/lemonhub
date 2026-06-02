import React from 'react';

const Loader = ({ size = 'default', fullscreen = false, text = 'Loading...' }) => {
  let spinnerSize = {
    small: { outer: '1.75rem', inner: '0.75rem', text: '0.8rem' },
    default: { outer: '3rem', inner: '1.5rem', text: '0.9rem' },
    large: { outer: '4rem', inner: '2rem', text: '1rem' }
  };
  
  const selectedSize = spinnerSize[size] || spinnerSize.default;
  
  const loaderComponent = (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="position-relative mb-2">
        <div className="spinner-border" 
          style={{ 
            color: 'rgba(255, 193, 7, 0.8)', 
            width: selectedSize.outer, 
            height: selectedSize.outer,
            borderWidth: '3px'
          }} 
          role="status">
        </div>
        <div className="spinner-grow position-absolute top-50 start-50 translate-middle" 
          style={{ 
            color: 'rgba(255, 235, 59, 0.9)', 
            width: selectedSize.inner, 
            height: selectedSize.inner 
          }} 
          role="status">
        </div>
      </div>
      {text && (
        <div className="text-center mt-2 fade-in">
          <span style={{ 
            fontSize: selectedSize.text, 
            color: '#777', 
            fontWeight: '500' 
          }}>
            {text}
          </span>
        </div>
      )}
    </div>
  );
  
  if (fullscreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1050,
          backdropFilter: 'blur(4px)'
        }}
      >
        {loaderComponent}
      </div>
    );
  }
  
  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '200px' }}>
      {loaderComponent}
    </div>
  );
};

export default Loader; 