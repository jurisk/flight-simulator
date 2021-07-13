import React from "react"
import {
    Vector3, Scene, SceneLoader, Sound, UniversalCamera, AbstractMesh,
} from "@babylonjs/core"
import SceneComponent from "babylonjs-hook"
import "./App.css"
import "@babylonjs/loaders/glTF"
import "@babylonjs/inspector"
import {newPressedKeys, PressedKeys, updateKeys} from "./keys"
import {Controls, updateControls} from "./controls"
import {loadAirplane, updateAirplane} from "./airplane"
import {bombHitsEarth, createUfos} from "./ufo"
import {fogSkyLight, loadMap, loadMapWithPhysics} from "./environment"
import {useSetRecoilState} from "recoil"
import {Difficulty, gameState} from "./state"
import {CannonJSPlugin} from "@babylonjs/core/Physics/Plugins"
import * as CANNON from "cannon"
import {createCannonBall} from "./cannon-ball"
import {isDebug} from "./util"
import {createGui, updateGui} from "./gui"
window.CANNON = CANNON

interface FlightSimulatorProps {
    difficulty: Difficulty,
}

interface AirplaneState {
    cannonShells: number,
}

const initialUfos: Record<Difficulty, number> = {
    [Difficulty.VeryEasy]: 1,
    [Difficulty.Easy]: 2,
    [Difficulty.Moderate]: 4,
    [Difficulty.Hard]: 8,
    [Difficulty.VeryHard]: 16,
}

interface EarthState {
    hitPoints: number,
}

export interface GameState {
    controls: Controls,
    airplane: AirplaneState,
    earth: EarthState,
}

// TODO: can aliens also have alien bases that they land and then you have to either strafe them with cannons or drop bombs?
// TODO: show HP bar for UFOs?
export const FlightSimulator = (props: FlightSimulatorProps): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    // TODO: you can lose by running out of ammo or running out of time (have the alien ships shoot lasers at the earth)
    const onSceneReady = async (scene: Scene) => {
        function cleanUp(): void {
            try {
                scene.dispose()
                camera.detachControl()
            } catch (e) {
                console.error(e)
            }
        }

        function gameLost(delay: number, reason: string): void {
            setTimeout(() => {
                cleanUp()
                setState({type: "GameLost", reason: reason})
            }, delay)
        }

        const gameWon = (delay: number) => {
            setTimeout(() => {
                cleanUp()
                setState({type: "GameWon"})
            }, delay)
        }

        SceneLoader.ShowLoadingScreen = true // does not seem to do anything

        scene.enablePhysics(new Vector3(0, -9.8, 0), new CannonJSPlugin())

        let pressedKeys: PressedKeys = newPressedKeys
        scene.onKeyboardObservable.add((e) => {
            pressedKeys = updateKeys(pressedKeys, e)
        })

        let gameState: GameState = {
            controls: {
                throttle: 0.75,
                roll: 0,
                rudder: 0,
                pitch: 0,
                fireCannons: false,
            },
            airplane: {
                cannonShells: 1000,
            },
            earth: {
                hitPoints: 1000,
            }
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

        const physicsGround = await loadMapWithPhysics(scene)
        const plainGround = await loadMap(scene)
        plainGround.isVisible = false

        const airplane = await loadAirplane()

        const guiSetters = createGui(scene)

        const ufos = await createUfos(scene, initialUfos[props.difficulty], (object, target) => {
            // TODO: make sound?
            if (target === physicsGround.physicsImpostor) {
                gameState = {
                    ...gameState,
                    earth: {
                        ...gameState.earth,
                        hitPoints: gameState.earth.hitPoints - 1,
                    }
                };

                (object.object as AbstractMesh).dispose()
                object.dispose()

                bombHitsEarth(scene, object.object.getAbsolutePosition())
            }
        })

        const gunshot = new Sound("gunshot", "assets/sounds/cannon.wav", scene, null,
            { playbackRate: 1, volume: 0.1 },
        )

        const onBeforeRender = () => {
            const deltaTime = scene.deltaTime
            gameState = {
                ...gameState,
                controls: updateControls(gameState.controls, deltaTime, pressedKeys),
            }
            updateAirplane(airplane.root, deltaTime, gameState.controls)
            ufos.forEach((ufo) =>
                ufo.update(deltaTime)
            )
            if (gameState.controls.fireCannons) {
                // Note - This is suboptimal because rate of fire depends on our framerate!
                if (gameState.airplane.cannonShells > 0) {
                    createCannonBall(airplane.root, ufos, plainGround, gunshot, scene)
                    gameState = {
                        ...gameState,
                        airplane: {
                            ...gameState.airplane,
                            cannonShells: gameState.airplane.cannonShells - 1,
                        }
                    }
                }
            }

            const followDirection = new Vector3(0, 0.2, -1)
            const FollowCameraDistance = 20
            camera.position = airplane.root.position.add(airplane.root.getDirection(followDirection).scale(FollowCameraDistance))
            camera.target = airplane.root.position

            updateGui(guiSetters, gameState, ufosAlive(), airplane.root.position)
        }

        scene.registerBeforeRender(onBeforeRender)

        const ufosAlive = (): number => ufos.filter((x) => !x.destructionFinished()).length

        const onAfterRender = () => {
            if (gameState.earth.hitPoints <= 0) {
                gameLost(0, "Alien invasion succeeded")
            } else if (ufosAlive() <= 0) {
                // wait a bit, only then go to "game won" screen
                gameWon(2000)
                return
            } else {
                const height = plainGround.getHeightAtCoordinates(airplane.root.position.x, airplane.root.position.z)
                const altitude = Math.max(0, height)
                if (airplane.root.position.y < altitude) {
                    // TODO: show explosion first, and thus use a delay
                    gameLost(0, "You crashed into the ground")
                    return
                }


                if (ufos.some((ufo) => ufo.sphere.intersectsMesh(airplane.children[0]))) {
                    // crashed into UFO!
                    gameLost(0,  "You crashed into an UFO")
                    return
                }
            }
        }

        scene.registerAfterRender(onAfterRender)

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
