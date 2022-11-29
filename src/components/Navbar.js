import React from "react"
import "./Navbar.css"
import arrow from "./arrow.svg"

export default function Navbar(props){
    return (
        <header className="navbar-container">
            <nav className="navbar">
                <h3 className="navbar-header">Vuong Do</h3>
                <div className="navbar-buttons-container">
                    <h3>Projects</h3>
                    <img className="navbar-buttons-arrow" alt="" src={arrow} />
                    <div className="navbar-buttons-trivia-game" onClick={(event) => props.handleClick(event, "triviagame")}>Trivia Game</div>
                    <div className="navbar-buttons-path-planning" onClick={(event) => props.handleClick(event, "pathplanning")}>Path Planning</div>
                </div>
            </nav>
        </header>
    )
}