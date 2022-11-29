import React from "react"
import './Quizlet.css'

import { nanoid } from 'nanoid'

export default function Quizlet(props){
    const [isOverlay, setIsOverlay] = React.useState(true)
    const [showResults, setShowResults] = React.useState(false)
    const [playAgain, setPlayAgain] = React.useState(false)
    const [correctAnswers, setCorrectAnswers] = React.useState(9)
    const [questions, setQuestions] = React.useState([])
    const [answerOptions, setAnswerOptions] = React.useState([])
    const [formData, setFormData] = React.useState({})
    // const [alert, setAlert] = React.useState("")
 
    React.useEffect(() => {
        fetch("https://opentdb.com/api.php?amount=5&difficulty=medium&type=multiple")
            .then(res => res.json())
            .then(data => {
                const questions = data.results
                setAnswerOptions(questions.map(item => {
                    const answers = [...item.incorrect_answers]
                    const randomIdx = Math.floor(Math.random()*(answers.length+1))
                    answers.splice(randomIdx, 0, item.correct_answer)
                    return answers
                }))
                setQuestions(questions)
                const formValues = Array(data.results.length).fill("");
                const formObj = formValues.reduce((previousValue, currentValue, index) => (
                    {
                        ...previousValue,
                        [`question${index}`]: currentValue
                    }
                ), {})
                setFormData(formObj)
            })
    }, [playAgain])

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function handleChange(event){
        if (!showResults){
            const {name, value} = event.target
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value
            }))
        }
    }

    function handleSubmit(event){
        if(showResults){
            setQuestions([])
            setShowResults(prevShowResults => !prevShowResults)
            setPlayAgain(prevState => !prevState)
        }else{
            let correctAnswersCounter = 0
            for(let i = 0; i < questions.length; i++){
                if(formData[`question${i}`] === questions[i].correct_answer)
                correctAnswersCounter++ 
            }
            setCorrectAnswers(correctAnswersCounter)
            setShowResults(prevShowResults => !prevShowResults)
        }
    }


    const QuestionElements = !!questions.length && !!answerOptions.length && questions.map((item, index) => {
        return (
            <React.Fragment key={nanoid()}>
                <label>{decodeHtml(item.question)}</label>
                <br />
                {
                    answerOptions[index].map(answer => {

                        const checked = formData[`question${index}`] === answer ? true : false;
                        const correctAnswer = item.correct_answer;
                        let classes = ""
                        if (showResults){
                            if (correctAnswer === answer){
                                classes = "selected-correct-answer"
                            }else if (checked)
                                classes = "selected-wrong-answer"
                            else
                                classes = "selected-grey"
                        }else if(checked){
                            classes = "selected"
                        }

                        return (
                            <React.Fragment key={nanoid()}>
                                <input  
                                    type="radio" 
                                    id={answer+index} 
                                    value={answer} 
                                    name={`question${index}`} 
                                    checked={checked}
                                    onChange={handleChange} />
                                <label className={`quizlet--trivia-button ${classes}`} htmlFor={answer+index}>{decodeHtml(answer)}</label>
                            </React.Fragment>
                        )
                    })
                }
                <hr />
            </React.Fragment>
        )
    })

    return (
        <div className="quizlet">
            {
                isOverlay === false
                ?
                    !!questions.length 
                    ?
                    <form>
                        <h1 className="">Please select all answers</h1>
                        {QuestionElements}
                        <div className="quizlet--trivia-submit-container">
                            {showResults && <h1>You scored {correctAnswers}/5 correct answers</h1>}
                            <button className="quizlet--trivia-submit-button" onClick={(event) => {
                                event.preventDefault()
                                const isEmpty = Object.values(formData).includes("")
                                if (isEmpty){
                                }
                                else
                                handleSubmit(event)
                            }}>{showResults ? "Play again" : "Check answers"}</button>
                        </div>
                    </form>     
                    :
                    <h1>Loading...</h1>     
                :
                <div className="quizlet--start-container">
                   <h1 className="quizlet--start-header">Quizzical</h1> 
                   <p className="quizlet--start-body">
                        Quizzical is a trivia game, try your best to get them all right. Good Luck!
                    </p>
                   <button className="quizlet--start-button" onClick={() => {setIsOverlay(prevState => !prevState)}}>Start quiz</button>
                </div>
            }
        </div>
    )
}