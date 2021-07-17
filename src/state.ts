import {atom} from "recoil"
import {isDebug} from "./util"

export interface MainMenu {
    type: "MainMenu",
}

export enum Difficulty {
    VeryEasy = "Very Easy", Easy = "Easy", Moderate = "Moderate", Hard = "Hard", VeryHard = "Very Hard",
}

export interface Playing {
    type: "Playing",
    difficulty: Difficulty,
}

export interface GameWon {
    type: "GameWon",
    difficulty: Difficulty,
    score: number,
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
