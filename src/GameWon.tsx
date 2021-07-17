import React from "react"
import {useSetRecoilState} from "recoil"
import {Difficulty, gameState} from "./state"
import {NesRightBalloon} from "./nes"

interface GameWonProps {
    difficulty: Difficulty,
    score: number,
}

export const GameWon = (props: GameWonProps): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <section className="topic">
            <h1>Victory</h1>

            <section className="nes-container">
                <div className="nes-container with-title is-centered">
                    <p className="title">Mission Succeeded on {props.difficulty}: <span style={{color: "#209cee"}}>{Number(props.score).toLocaleString()}</span> points</p>
                    <p className="nes-text is-success">Great Success!!! You have destroyed the alien invasion force end defended your world!</p>
                </div>

                <section className="message-list">
                    <NesRightBalloon>CATS: You have defeated me!</NesRightBalloon>
                    <NesRightBalloon>CATS: But I will return later, with greater forces!!!</NesRightBalloon>
                </section>

                <button className="nes-btn is-primary" onClick={() => setState({type: "MainMenu"})}>Main Menu</button>
            </section>
        </section>
    )
}
