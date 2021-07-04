import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState, State} from "./state"

export const MainMenu = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    const texts = [
        "In A.D. 2101",
        "war was beginning",
        "Captain: What happen ?",
        "Mechanic: Somebody set up us the bomb.",
        "Operator: We get signal.",
        "Captain: What!",
        "Operator: Main screen turn on.",
        "Captain: It's you!",
        "CATS: How are you gentlemen !!",
        "CATS: All your base are belong to us.",
        "CATS: You are on the way to destruction.",
        "Captain: What you say !!",
        "CATS: You have no chance to survive make your time.",
        "CATS: Ha ha ha ha ..",
        "Operator: Captain!!",
        "Captain: Take off every 'ZIG'!!",
        "Captain: You know what you doing.",
        "Captain: Move 'ZIG'.",
        "Captain: For great justice.",
        "",
        "Use ESDFWR to control plane"
    ]

    return (
        <div>
            <h1>Main Menu</h1>

            {texts.map((x, idx) =>
                <div key={idx}>
                    {x}
                </div>
            )}

            <button onClick={() => setState(State.Playing)}>Play</button>
        </div>
    )
}
