import {atom} from "recoil"
import {isDebug} from "./util"

export interface MainMenu {
    type: "MainMenu",
}

export interface Playing {
    type: "Playing",
    ufos: number,
}

export interface GameWon {
    type: "GameWon",
}

export interface GameLost {
    type: "GameLost",
}

export type State = MainMenu | Playing | GameWon | GameLost


export const gameState = atom<State>({
    key: "gameState",
    default: isDebug() ? { type: "Playing", ufos: 2 } : { type: "MainMenu" },
})
