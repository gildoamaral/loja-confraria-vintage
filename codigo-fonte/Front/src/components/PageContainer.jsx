import React from 'react';

const PageContainer = ({ children, className, style, ...rest }) => (
  <div
    className={className}
    style={{
      // marginTop: "5rem",
      // marginBottom: "7rem",
      // backgroundColor: "red",
      ...style
    }}
    {...rest}
  >
    {children}
  </div >
);

export default PageContainer;