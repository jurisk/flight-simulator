import React from "react"
import {useRecoilValue} from "recoil"
import {gameState, State} from "./state"
import {FlightSimulator} from "./FlightSimulator"
import {MainMenu} from "./MainMenu"
import {GameWon} from "./GameWon"
import {GameLost} from "./GameLost"

export const Game = (): JSX.Element => {
    const state = useRecoilValue(gameState)

    switch (state) {
    case State.MainMenu:
        return (<MainMenu/>)
    case State.Playing:
        return (<FlightSimulator/>)
    case State.GameLost:
        return (<GameLost/>)
    case State.GameWon:
        return (<GameWon/>)
    }
}
