import "./App.css"
import { RecoilRoot } from "recoil"

import React from "react"

import "./App.css"
import {DeclarativeFlightSimulator} from "./DeclarativeFlightSimulator"

export const App: React.FC = () => {
    return (
        <RecoilRoot>
            <DeclarativeFlightSimulator/>
        </RecoilRoot>
    )
}
