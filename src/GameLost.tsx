import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"

interface GameLostProps {
    reason: string,
}

export const GameLost = (props: GameLostProps): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <section className="topic">
            <h1>Defeat</h1>

            <section className="nes-container with-title is-centered">
                <p className="title">Mission Failed: {props.reason}</p>
                <p className="nes-text is-error">You have failed in your mission and aliens have taken over your world! Sad!!!</p>
                <img style={{maxWidth: "50%", padding: "1em"}} src="./assets/images/cats-aybrb2u.png"/>

                <div>
                    <button className="nes-btn is-primary" onClick={() => setState({type: "MainMenu"})}>Main Menu</button>
                </div>
            </section>
        </section>
    )
}
