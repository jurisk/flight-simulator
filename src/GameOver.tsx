import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState, State} from "./state"

export const GameOver = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <div>
            <h1>Game Over</h1>

            <button onClick={() => setState(State.Playing)}>Play Again</button>
        </div>
    )
}
