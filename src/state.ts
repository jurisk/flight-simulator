import {atom} from "recoil"
import {isDebug} from "./util"

export interface MainMenu {
    type: "MainMenu",
}

export enum Difficulty {
    VeryEasy, Easy, Moderate, Hard, VeryHard,
}

export interface Playing {
    type: "Playing",
    difficulty: Difficulty,
}

export interface GameWon {
    type: "GameWon",
}

export interface GameLost {
    type: "GameLost",
    reason: string,
}

export type State = MainMenu | Playing | GameWon | GameLost


export const gameState = atom<State>({
    key: "gameState",
    default: isDebug() ? { type: "Playing", difficulty: Difficulty.Easy } : { type: "MainMenu" },
})
