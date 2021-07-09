import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"
import {NesRightBalloon} from "./nes"

export const GameLost = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <section className="topic">
            <h1>Defeat</h1>

            <section className="nes-container">
                <div className="nes-container with-title is-centered">
                    <p className="title">Mission Failed</p>
                    <p className="nes-text is-error">You have failed in your mission and aliens have taken over your world! Sad!!!</p>
                </div>

                <section className="message-list">
                    <NesRightBalloon>CATS: Ha ha ha ha!</NesRightBalloon>
                    <NesRightBalloon>CATS: All your base are belong to us!!!</NesRightBalloon>
                </section>

                <button className="nes-btn is-primary" onClick={() => setState({type: "MainMenu"})}>Main Menu</button>
            </section>
        </section>
    )
}
