import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState, State} from "./state"

export const GameLost = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <div>
            <h1>Defeat</h1>

            <div>
                You have failed in your mission and aliens have taken over your flat world. Sad!
            </div>

            <button onClick={() => setState(State.Playing)}>Play Again</button>
        </div>
    )
}
