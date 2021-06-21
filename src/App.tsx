import "./App.css"
import React from "react"
import {Boxen} from "./Boxen"
import { RecoilRoot } from "recoil"
import {CharacterCounter} from "./CharacterCounter"

export function App(): JSX.Element {
    return (
        <>
            <Boxen/>
            <RecoilRoot>
                <CharacterCounter />
            </RecoilRoot>
        </>
    )
}
