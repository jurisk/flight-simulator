import "./App.css"
import { RecoilRoot } from "recoil"
import {CharacterCounter} from "./CharacterCounter"

import React from "react"

import "@babylonjs/core/Physics/physicsEngineComponent"  // side-effect adds scene.enablePhysics function

import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins"

import { Scene, Engine } from "react-babylonjs"
import "./App.css"

import * as CANNON from "cannon"
import {SceneWithSpinningBoxes} from "./Boxen"
window.CANNON = CANNON

const gravityVector = new Vector3(0, -9.81, 0)

export const App: React.FC = () => {

    return (
        <div>
            <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
                <Scene enablePhysics={[gravityVector, new CannonJSPlugin()]}>
                    {/*<BouncyBallScene/>*/}
                    <SceneWithSpinningBoxes/>
                </Scene>
            </Engine>
        </div>
    )
}

export function RecoilComponentsTest(): JSX.Element {
    return (
        <>
            <RecoilRoot>
                <CharacterCounter />
            </RecoilRoot>
        </>
    )
}

