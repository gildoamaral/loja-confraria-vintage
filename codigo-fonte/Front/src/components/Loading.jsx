import React from 'react'

const Loading = () => {
  return (
    <>
      <style>
        {`
          .loading {
            width: 40px;
            height: 40px;
            margin: 10rem auto;
            border: 4px solid #ccc;
            border-top: 4px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

           @keyframes spin {
            0% {
             transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
           }
          }
        `}
      </style>

      <div className='loading' />
    </>
  )
}

export default Loading