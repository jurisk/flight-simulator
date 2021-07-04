import React from "react"
import {
    Vector3, Scene, ArcRotateCamera, SceneLoader, Mesh, AbstractMesh, StandardMaterial,
} from "@babylonjs/core"
import SceneComponent from "babylonjs-hook"
import "./App.css"
import "@babylonjs/loaders/glTF"
import "@babylonjs/inspector"
import {newPressedKeys, PressedKeys, updateKeys} from "./keys"
import {Controls, updateControls} from "./controls"
import {loadAirplane, updateAirplane} from "./airplane"
import {loadUfo, updateUfo} from "./ufo"
import {fogSkyLight, loadMap} from "./environment"
import {useSetRecoilState} from "recoil"
import {gameState, State} from "./state"
import {CannonJSPlugin} from "@babylonjs/core/Physics/Plugins"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"
import * as CANNON from "cannon"
import {Color3} from "@babylonjs/core/Maths/math.color"
window.CANNON = CANNON

export const FlightSimulator = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    function gameOver() {
        setState(State.GameOver)
    }

    const onSceneReady = async (scene: Scene) => {
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

        scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))

        const engine = scene.getEngine()
        const canvas = engine.getRenderingCanvas()

        fogSkyLight(scene)

        const camera = new ArcRotateCamera("arc-rotate-camera", 0, 0.8, 100, Vector3.Zero(), scene)
        camera.attachControl(canvas, false)

        const ground = await loadMap(scene)
        ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.HeightmapImpostor, { mass: 0 })

        const airplane = await loadAirplane()

        const collisionAirplaneMesh = airplane.children[0] // .root didn't have vertices
        collisionAirplaneMesh.physicsImpostor = new PhysicsImpostor(collisionAirplaneMesh, PhysicsImpostor.MeshImpostor, { mass: 0, friction: 0, restitution: 0 }, scene)
        collisionAirplaneMesh.physicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main) {
            console.log("boom");

            // TODO: explosion here
            ((main.object as AbstractMesh).material as StandardMaterial).diffuseColor = new Color3(Math.random(), Math.random(), Math.random())

            // TODO: unfortunately this crashes with "Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
            gameOver()
        })

        const followDirection = new Vector3(0, 0.2, -1)
        const FollowCameraDistance = 20

        camera.position = airplane.root.position
            .add(airplane.root.getDirection(followDirection).scale(FollowCameraDistance))

        const ufo = await loadUfo()

        const createCannonBall = function (airplane: AbstractMesh) {
            const ball = Mesh.CreateSphere("cannon-ball", 8, 1, scene)
            ball.position.copyFrom(airplane.position)
            ball.physicsImpostor = new PhysicsImpostor(ball, PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0, restitution: 0 })
        }

        scene.registerBeforeRender(() => {
            if (airplane && ufo) {
                const deltaTime = scene.deltaTime
                controls = updateControls(controls, deltaTime, pressedKeys)

                updateAirplane(airplane.root, deltaTime, controls)
                updateUfo(ufo.root, deltaTime)

                if (controls.fireCannons) {
                    createCannonBall(airplane.root)
                }

                camera.target = airplane.root.position
            }
        })

        engine.runRenderLoop(() => scene.render())
    }

    return (
        <SceneComponent
            antialias={true}
            onSceneReady={onSceneReady}
            id='canvas'
        />
    )
}
