import React from 'react'
import './Canvas.css'
import useExternalScripts from "./hooks/useExternalScripts"

export default function Canvas(props){
    useExternalScripts(process.env.PUBLIC_URL + '/p5.min.js')
    useExternalScripts(process.env.PUBLIC_URL + '/sketch.js')

    return (
        <div id="myContainer">
            <h1 className="header--rrt">Rapidly Exploring Random Tree (RRT) - Sampling Based Path Planning Algorithm</h1>
        </div>
    )
}