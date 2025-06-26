import React, { useState } from 'react'

const ToolTip = ({ text, children }:any) => {
    const [visible, setVisible] = useState(false);
  
    return (
      <div
        className="md:relative flex items-center"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
        {visible && (
          <div className="absolute top-1/2 left-0 md:left-full  font-normal text-left z-10 p-5 bg-[#F7F7F7]  shadow-lg text-xs md:text-sm   rounded-md">
            <pre>{text}</pre>
          </div>
        )}
      </div>
    );
  };

export default ToolTip