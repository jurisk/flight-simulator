import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"
import {NesLeftBalloon, NesRightBalloon} from "./nes"

export const MainMenu = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <section className="topic">
            <h1>Main Menu</h1>

            <section className="showcase">
                <section className="nes-container with-title">
                    <p className="title">Situation Report</p>

                    <section className="message-list">
                        <div className="nes-container is-rounded">
                            <p className="nes-text is-error">In A.D. 2101 war was beginning</p>
                        </div>
                        <NesLeftBalloon>Captain: What happen ?</NesLeftBalloon>
                        <NesLeftBalloon>Mechanic: Somebody set up us the bomb.</NesLeftBalloon>
                        <NesLeftBalloon>Operator: We get signal.</NesLeftBalloon>
                        <NesLeftBalloon>Captain: What!</NesLeftBalloon>
                        <NesLeftBalloon>Operator: Main screen turn on.</NesLeftBalloon>
                        <NesLeftBalloon>Captain: It&apos;s you!</NesLeftBalloon>
                        <NesRightBalloon>CATS: How are you gentlemen !!</NesRightBalloon>
                        <NesRightBalloon>CATS: All your base are belong to us.</NesRightBalloon>
                        <NesRightBalloon>CATS: You are on the way to destruction.</NesRightBalloon>
                        <NesLeftBalloon>Captain: What you say !!</NesLeftBalloon>
                        <NesRightBalloon>CATS: You have no chance to survive make your time.</NesRightBalloon>
                        <NesRightBalloon>CATS: Ha ha ha ha ..</NesRightBalloon>
                        <NesLeftBalloon>Operator: Captain !!</NesLeftBalloon>
                        <NesLeftBalloon>Captain: Take off every &apos;ZIG&apos; !!</NesLeftBalloon>
                        <NesLeftBalloon>Captain: You know what you doing.</NesLeftBalloon>
                        <NesLeftBalloon>Captain: Move &apos;ZIG&apos;.</NesLeftBalloon>
                        <NesLeftBalloon>Captain: For great justice.</NesLeftBalloon>
                    </section>
                </section>
            </section>

            <section className="showcase">
                <div className="nes-container with-title">
                    <p className="title">Controls</p>
                    <div>Use:
                        <ul>
                            <li>`E` and `D` for pitch</li>
                            <li>`S` and `F` for roll</li>
                            <li>`W` and `R` for rudder</li>
                            <li>`Space` to shoot cannon</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="showcase">
                <section className="nes-container with-title is-centered">
                    <p className="title">Move &apos;ZIG&apos;</p>
                    <button className="nes-btn is-success" onClick={() => setState({type: "Playing", ufos: 1})}>Easy</button>
                    <button className="nes-btn is-warning" onClick={() => setState({type: "Playing", ufos: 3})}>Moderate</button>
                    <button className="nes-btn is-error" onClick={() => setState({type: "Playing", ufos: 7})}>Hard</button>
                </section>
            </section>
        </section>
    )
}
