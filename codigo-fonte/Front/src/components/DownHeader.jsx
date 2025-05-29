import React from 'react'
import holder from "../assets/holder.jpg"

const DownHeader = () => {
  return (
    <div>
      
      <div style={
        {
          overflow: 'hidden',
          width: '100%',
          height: '450px',
          backgroundImage: `url(${holder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // marginBottom: '100px',
        }
      }>
        <div style={{backgroundColor: 'rgba(247, 246, 244, 0.5)', padding: '30px', color: 'var(--cor-fonte)', fontSize: '0.6rem', textAlign: 'center', borderRadius: '10px'}}>
        <h1 style={{fontFamily: "Allison", fontSize: "4rem"}}>Bem-vinda ao nosso site!</h1>
        <p style={{fontSize: "1rem"}}>Explore nossos produtos e aproveite as melhores ofertas.</p>
        </div>


      </div>

    </div>
  )
}

export default DownHeader