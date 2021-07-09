import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"
import {NesRightBalloon} from "./nes"

export const GameWon = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <section className="topic">
            <h1>Victory</h1>

            <section className="nes-container">
                <div className="nes-container with-title is-centered">
                    <p className="title">Mission Succeeded</p>
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
