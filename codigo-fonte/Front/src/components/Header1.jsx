import React from 'react'
import Logo from './Logo'
import Navbar from './navbar'


const Header = ({ invisivel }) => {
  return (
    <header style={styles.header}>
      <Logo />
      <Navbar invisivel={invisivel}/>
    </header>
  )
}

const styles = {
  header: {
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    // position: 'absolute',
    // top: '0',
    background: 'radial-gradient(circle, var(--cor-principal) 40%, var(--cor-principal2) 190%)'
  },
  }

export default Header;