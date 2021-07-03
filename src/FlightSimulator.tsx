import React from "react"
import {
    Vector3, Scene, ArcRotateCamera, AssetsManager, AbstractMesh,
} from "@babylonjs/core"
import SceneComponent from "babylonjs-hook"
import "./App.css"
import "@babylonjs/loaders/glTF"
import "@babylonjs/inspector"
import {Nullable} from "@babylonjs/core/types"
import {newPressedKeys, PressedKeys, updateKeys} from "./keys"
import {Controls, updateControls} from "./controls"
import {loadAirplane, updateAirplane} from "./airplane"
import {loadUfo, updateUfo} from "./ufo"
import {fogSkyLight, loadMap} from "./environment"

const onSceneReady = (scene: Scene) => {
    let pressedKeys: PressedKeys = newPressedKeys
    scene.onKeyboardObservable.add((e) => {
        pressedKeys = updateKeys(pressedKeys, e)
    })

    let controls: Controls = {
        throttle: 0.75,
        roll: 0,
        rudder: 0,
        pitch: 0,
    }

    scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))

    const engine = scene.getEngine()
    const canvas = engine.getRenderingCanvas()
    const assetsManager = new AssetsManager(scene)

    fogSkyLight(scene)

    const camera = new ArcRotateCamera("arc-rotate-camera", 0, 0.8, 100, Vector3.Zero(), scene)
    camera.attachControl(canvas, false)

    let airplane: Nullable<AbstractMesh> = null
    loadAirplane(assetsManager, (mesh) => {
        airplane = mesh

        const followDirection = new Vector3(0, 0.2, -1)
        const FollowCameraDistance = 20

        camera.position = mesh.position
            .add(mesh.getDirection(followDirection).scale(FollowCameraDistance))
    })

    let ufo: Nullable<AbstractMesh> = null
    loadUfo(assetsManager, (mesh) => {
        ufo = mesh
    })

    loadMap(scene)

    scene.registerBeforeRender(() => {
        if (airplane && ufo) {
            const deltaTime = scene.deltaTime
            controls = updateControls(controls, deltaTime, pressedKeys)

            updateAirplane(airplane, deltaTime, controls)
            updateUfo(ufo, deltaTime)

            camera.target = airplane.position
        }
    })

    assetsManager.onFinish = () => engine.runRenderLoop(() => scene.render())

    assetsManager.load()
}

export const FlightSimulator = (): JSX.Element => (
    <SceneComponent
        antialias={true}
        onSceneReady={onSceneReady}
        id='canvas'
    />
)
