import React, {useEffect, useState} from "react"
import {useSetRecoilState} from "recoil"
import {Difficulty, gameState} from "./state"
import {NesLeftBalloon, NesRightBalloon} from "./nes"
import {List} from "immutable"
import "./MainMenu.css"

const IntroMessages = List.of(
    <div className="nes-container is-rounded"><p className="nes-text is-error">In A.D. 2101 war was beginning</p></div>,
    <NesLeftBalloon>Captain: What happen ?</NesLeftBalloon>,
    <NesLeftBalloon>Mechanic: Somebody set up us the bomb.</NesLeftBalloon>,
    <NesLeftBalloon>Operator: We get signal.</NesLeftBalloon>,
    <NesLeftBalloon>Captain: What!</NesLeftBalloon>,
    <NesLeftBalloon>Operator: Main screen turn on.</NesLeftBalloon>,
    <NesLeftBalloon>Captain: It&apos;s you!</NesLeftBalloon>,
    <NesRightBalloon>CATS: How are you gentlemen !!</NesRightBalloon>,
    <NesRightBalloon>CATS: All your base are belong to us.</NesRightBalloon>,
    <NesRightBalloon>CATS: You are on the way to destruction.</NesRightBalloon>,
    <NesLeftBalloon>Captain: What you say !!</NesLeftBalloon>,
    <NesRightBalloon>CATS: You have no chance to survive make your time.</NesRightBalloon>,
    <NesRightBalloon>CATS: Ha ha ha ha ..</NesRightBalloon>,
    <NesLeftBalloon>Operator: Captain !!</NesLeftBalloon>,
    <NesLeftBalloon>Captain: Take off every &apos;ZIG&apos; !!</NesLeftBalloon>,
    <NesLeftBalloon>Captain: You know what you doing.</NesLeftBalloon>,
    <NesLeftBalloon>Captain: Move &apos;ZIG&apos;.</NesLeftBalloon>,
    <NesLeftBalloon>Captain: For great justice.</NesLeftBalloon>,
    <div className="nes-container is-rounded"><p className="nes-text">Defeat the alien invasion force!</p></div>,
)

export const MainMenu = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIndex(index + 1)
        }, 2000)

        return () => clearTimeout(timer)
    })

    const selectedMessage = IntroMessages.get(index) || IntroMessages.last()

    // TODO: maybe add music
    return (
        <section className="topic">
            <h1>Main Menu</h1>

            <section className="showcase">
                <section className="nes-container with-title">
                    <p className="title">Situation Report</p>

                    <section className="message-list">
                        {selectedMessage}
                    </section>
                </section>
            </section>

            <section className="showcase">
                <div className="nes-container with-title">
                    <p className="title">Controls</p>
                    <div>Use:
                        <ul>
                            <li>`E` and `D` or `Up` and `Down` arrows for pitch</li>
                            <li>`S` and `F` or `Left` and `Right` arrows for roll</li>
                            <li>`W` and `R` for rudder</li>
                            <li>`Space` to shoot cannon</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="showcase">
                <section className="nes-container with-title is-centered">
                    <p className="title">Move &apos;ZIG&apos;</p>
                    <button className="nes-btn is-success" onClick={() => setState({type: "Playing", difficulty: Difficulty.VeryEasy})}>Very Easy</button>
                    <button className="nes-btn is-success button-easy" onClick={() => setState({type: "Playing", difficulty: Difficulty.Easy})}>Easy</button>
                    <button className="nes-btn is-warning" onClick={() => setState({type: "Playing", difficulty: Difficulty.Moderate})}>Moderate</button>
                    <button className="nes-btn is-error button-hard" onClick={() => setState({type: "Playing", difficulty: Difficulty.Hard})}>Hard</button>
                    <button className="nes-btn is-error" onClick={() => setState({type: "Playing", difficulty: Difficulty.VeryHard})}>Very Hard</button>
                </section>
            </section>
        </section>
    )
}
