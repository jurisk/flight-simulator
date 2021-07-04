import React from "react"
import {
    Vector3, Scene, ArcRotateCamera, AssetsManager, AbstractMesh, StandardMaterial,
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
import {useSetRecoilState} from "recoil"
import {gameState, State} from "./state"
import {CannonJSPlugin} from "@babylonjs/core/Physics/Plugins"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"
import {Mesh} from "@babylonjs/core/Meshes/mesh"
import * as CANNON from "cannon"
import {Color3} from "@babylonjs/core/Maths/math.color"
window.CANNON = CANNON

export const FlightSimulator = (): JSX.Element => {
    const setState = useSetRecoilState(gameState)

    function gameOver() {
        setState(State.GameOver)
    }

    const onSceneReady = (scene: Scene) => {
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
        }

        scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))

        const engine = scene.getEngine()
        const canvas = engine.getRenderingCanvas()
        const assetsManager = new AssetsManager(scene)

        fogSkyLight(scene)

        const camera = new ArcRotateCamera("arc-rotate-camera", 0, 0.8, 100, Vector3.Zero(), scene)
        camera.attachControl(canvas, false)

        let groundImpostor: Nullable<PhysicsImpostor> = null
        loadMap(scene, (ground) => {
            groundImpostor = new PhysicsImpostor(ground, PhysicsImpostor.HeightmapImpostor, { mass: 0 })
            ground.physicsImpostor = groundImpostor
        })

        let airplane: Nullable<AbstractMesh> = null
        loadAirplane(scene, assetsManager, camera, (mesh) => {
            airplane = mesh

            if (airplane !== null) {
                if (groundImpostor !== null) {
                    // TODO: unfortunately, MeshImpostor fails as vertex for 0-th indexed mesh is null
                    // airplane.physicsImpostor = new PhysicsImpostor(airplane, PhysicsImpostor.MeshImpostor, { mass: 0, friction: 0, restitution: 0 })
                    // console.log(airplane.physicsImpostor)
                    // airplane.physicsImpostor.registerOnPhysicsCollide(groundImpostor, function(main) {
                    //     // TODO: explosion here
                    //     ((main.object as AbstractMesh).material as StandardMaterial).diffuseColor = new Color3(Math.random(), Math.random(), Math.random())
                    //
                    //     // TODO: unfortunately this crashes with "Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
                    //     // gameOver()
                    // })
                }

                const followDirection = new Vector3(0, 0.2, -1)
                const FollowCameraDistance = 20

                camera.position = airplane.position
                    .add(airplane.getDirection(followDirection).scale(FollowCameraDistance))
            }
        })

        let ufo: Nullable<AbstractMesh> = null
        loadUfo(assetsManager, (mesh) => {
            ufo = mesh
        })

        // TODO: just a physics test, remove later
        // const createBall = function () {
        //     const ball = Mesh.CreateSphere("s", 8, 8, scene)
        //     ball.position.y = 500
        //     ball.position.x = (Math.random() * 100) * ((Math.random() < 0.5) ? -1 : 1)
        //     ball.position.z = (Math.random() * 100) * ((Math.random() < 0.5) ? -1 : 1)
        //     ball.physicsImpostor = new PhysicsImpostor(ball, PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0, restitution: 0 })
        // }
        //
        // createBall()
        // createBall()
        // createBall()
        // createBall()
        // createBall()

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

    return (
        <SceneComponent
            antialias={true}
            onSceneReady={onSceneReady}
            id='canvas'
        />
    )
}
