import "./App.css"
import { RecoilRoot } from "recoil"

import React from "react"

import { Engine } from "react-babylonjs"
import "./App.css"
import {TerrainScene} from "./FlightSimulator"

export const App: React.FC = () => {
    return (
        <RecoilRoot>
            <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
                <TerrainScene/>
            </Engine>
        </RecoilRoot>
    )
}
