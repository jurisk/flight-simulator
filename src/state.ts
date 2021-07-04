import {atom} from "recoil"

export enum State {
    MainMenu,
    Playing,
    GameOver,
}

export const gameState = atom<State>({
    key: "gameState",
    default: State.Playing, // TODO: switch to Main Menu later
})
