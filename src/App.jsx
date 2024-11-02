import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { FieldScene } from './components/FieldScene'
import { useField } from './hooks/useField'
import { useStart } from './hooks/useStart'

function App() {
  const { isStart } = useStart();
  const { field } = useField(isStart);
  return (
    <>
      
      <FieldScene field={field} ></FieldScene>
    </>
  )
}

export default App
