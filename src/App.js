import React from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Quizlet from './components/Quizlet'
import Canvas from './components/Canvas'

function App() {
  const [selectedProject, setSelectedProject] = React.useState("triviagame")
  function changeProject(event, project){
    setSelectedProject(project)
  }

  return (
    <div className="app">
      <Navbar handleClick={changeProject} />
      {
        selectedProject === "triviagame" ? <Quizlet /> : <Canvas />
      }
      <footer></footer>
    </div>
  )
}

export default App
