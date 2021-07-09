import React from "react"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"

export const GameWon = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    return (
        <div>
            <h1>Victory</h1>

            <div>
                Great success!!!

                You have destroyed the alien invasion force end defended your world!
            </div>

            <button onClick={() => setState({type: "MainMenu"})}>Main Menu</button>
        </div>
    )
}
