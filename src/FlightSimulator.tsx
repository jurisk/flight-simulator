import React from "react"
import {
    Vector3, Scene, SceneLoader, Sound, UniversalCamera,
} from "@babylonjs/core"
import SceneComponent from "babylonjs-hook"
import "./App.css"
import "@babylonjs/loaders/glTF"
import "@babylonjs/inspector"
import {newPressedKeys, PressedKeys, updateKeys} from "./keys"
import {Controls, updateControls} from "./controls"
import {loadAirplane, updateAirplane} from "./airplane"
import {createUfos} from "./ufo"
import {fogSkyLight, loadMap, loadMapWithPhysics} from "./environment"
import {useSetRecoilState} from "recoil"
import {gameState} from "./state"
import {CannonJSPlugin} from "@babylonjs/core/Physics/Plugins"
import * as CANNON from "cannon"
import {createCannonBall} from "./cannon-ball"
import {isDebug} from "./util"
window.CANNON = CANNON

interface FlightSimulatorProps {
    ufos: number,
}

export const FlightSimulator = (props: FlightSimulatorProps): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    // TODO: also be able to drop a few bombs which are slower, have area impact and can kill both the plane and the alien ship!
    const onSceneReady = async (scene: Scene) => {
        function cleanUp(): void {
            scene.dispose()
            camera.detachControl()
        }

        function gameLost(): void {
            cleanUp()
            setState({type: "GameLost"})
        }

        const gameWon = () => {
            cleanUp()
            setState({type: "GameWon"})
        }

        SceneLoader.ShowLoadingScreen = true // does not seem to do anything

        scene.enablePhysics(new Vector3(0, -9.8, 0), new CannonJSPlugin())

        let pressedKeys: PressedKeys = newPressedKeys
        scene.onKeyboardObservable.add((e) => {
            pressedKeys = updateKeys(pressedKeys, e)
        })

        let controls: Controls = {
            throttle: 0.75,
            roll: 0,
            rudder: 0,
            pitch: 0,
            fireCannons: false,
        }

        if (isDebug()) {
            scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))
        }

        const engine = scene.getEngine()
        const canvas = engine.getRenderingCanvas()

        fogSkyLight(scene)

        const camera = new UniversalCamera("universal-camera", Vector3.Zero(), scene)
        camera.attachControl(canvas, false)
        const canvasElement = document.getElementById("canvas")
        if (canvasElement) { // TODO: this doesn't really work, focus is not really gained
            canvasElement.focus()
            canvasElement.onblur = () => {
                canvasElement.focus()
            }
        } else {
            console.log("No canvas")
        }

        await loadMapWithPhysics(scene)
        const plainGround = await loadMap(scene)
        plainGround.isVisible = false

        const airplane = await loadAirplane()

        const ufos = await createUfos(scene, props.ufos)

        const gunshot = new Sound("gunshot", "assets/sounds/cannon.wav", scene, null,
            { playbackRate: 1, volume: 0.1 },
        )

        scene.registerBeforeRender(() => {
            if (ufos.every((x) => x.destructionFinished())) {
                // wait a bit, only then go to "game won" screen
                gameWon()
                return
            }

            const height = plainGround.getHeightAtCoordinates(airplane.root.position.x, airplane.root.position.z)
            const altitude = Math.max(0, height)
            console.log(airplane.root.position.x, airplane.root.position.z, height)

            if (airplane.root.position.y < altitude) {
                // TODO: show explosion first, only then go to "game lost" screen
                gameLost()
                return
            }

            const deltaTime = scene.deltaTime
            controls = updateControls(controls, deltaTime, pressedKeys)

            updateAirplane(airplane.root, deltaTime, controls)

            ufos.forEach((ufo) =>
                ufo.update(deltaTime)
            )

            if (controls.fireCannons) {
                // Note - This is suboptimal because rate of fire depends on our framerate!
                createCannonBall(airplane.root, ufos, plainGround, gunshot, scene)
                // TODO: have a lot but not infinite ammo
            }

            const followDirection = new Vector3(0, 0.2, -1)
            const FollowCameraDistance = 20
            camera.position = airplane.root.position.add(airplane.root.getDirection(followDirection).scale(FollowCameraDistance))
            camera.target = airplane.root.position
        })

        engine.runRenderLoop(() => {
            try {
                scene.render()
            } catch (e) {
                console.error(e)
            }
        })
    }



    return (
        <div>
            {/* Without this `div` it crashes with "Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node." */}

            <SceneComponent
                antialias={true}
                onSceneReady={onSceneReady}
                id='canvas'
            />
        </div>
    )
}
