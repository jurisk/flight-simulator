import "./App.css"
import { RecoilRoot } from "recoil"

import React from "react"

import "./App.css"
import {FlightSimulator} from "./FlightSimulator"

export const App: React.FC = () => {
    return (
        <RecoilRoot>
            <FlightSimulator/>
        </RecoilRoot>
    )
}
