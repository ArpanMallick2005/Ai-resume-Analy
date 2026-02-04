import React from 'react'

const Loader = ({ size = 48, color = 'border-gray-400', fullScreen = true }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : ''}`}>
        <div 
          style={{ width: size, height: size }}
          className={`border-3 ${color} border-t-transparent rounded-full animate-spin`}
        >
        </div>
    </div>
  )
}

export default Loader;