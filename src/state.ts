import {atom} from "recoil"

export enum State {
    MainMenu,
    Playing,
    GameWon,
    GameLost,
}

export const gameState = atom<State>({
    key: "gameState",
    default: State.Playing,
})
