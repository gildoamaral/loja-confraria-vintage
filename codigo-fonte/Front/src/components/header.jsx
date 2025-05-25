import React from 'react'
import Logo from './Logo'
import Navbar from './navbar'


const Header = () => {
  return (
    <header style={styles.header}>
      <Logo />
      <Navbar />
    </header>
  )
}

const styles = {
  header: {
    display: 'flex', 
    flexDirection: 'column',
    // justifyContent: 'space-around', 
    alignItems: 'center',
    marginBottom: '7rem',
    width: '100%',
    // position: 'absolute',
    // top: '0',
    // backgroundColor: 'red',
    height: 'auto',
  },
  }

export default Header