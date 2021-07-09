import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"

export const GameLost = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <div>
            <h1>Defeat</h1>

            <div>
                You have failed in your mission and aliens have taken over your world!

                Sad!

                CATS: Ha ha ha ha!
                CATS: All your base are belong to us!!!
            </div>

            <button onClick={() => setState({type: "MainMenu"})}>Main Menu</button>
        </div>
    )
}
