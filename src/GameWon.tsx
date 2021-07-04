import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState, State} from "./state"

export const GameWon = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <div>
            <h1>Victory</h1>

            <div>
                Great success!!!

                You have destroyed the alien invasion force end defended your flat world!
            </div>

            <button onClick={() => setState(State.Playing)}>Play Again</button>
        </div>
    )
}
