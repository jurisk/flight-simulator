import React from "react"
import {useRecoilValue} from "recoil"
import {gameState} from "./state"
import {FlightSimulator} from "./FlightSimulator"
import {MainMenu} from "./MainMenu"
import {GameWon} from "./GameWon"
import {GameLost} from "./GameLost"

export const Game = (): JSX.Element => {
    const state = useRecoilValue(gameState)

    switch (state.type) {
    case "MainMenu":
        return (<MainMenu/>)
    case "Playing":
        return (<FlightSimulator difficulty={state.difficulty}/>)
    case "GameLost":
        return (<GameLost/>)
    case "GameWon":
        return (<GameWon/>)
    }
}
