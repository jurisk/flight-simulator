import "./App.css"
import {RecoilRoot} from "recoil"

import React from "react"

import "./App.css"
import {Game} from "./Game"

export const App: React.FC = () => {
    return (
        <RecoilRoot>
            <Game/>
        </RecoilRoot>
    )
}
