import React from "react"
import {
    Vector3, Scene, SceneLoader, Mesh, AbstractMesh, StandardMaterial, Sound, FreeCamera,
} from "@babylonjs/core"
import SceneComponent from "babylonjs-hook"
import "./App.css"
import "@babylonjs/loaders/glTF"
import "@babylonjs/inspector"
import {newPressedKeys, PressedKeys, updateKeys} from "./keys"
import {Controls, updateControls} from "./controls"
import {loadAirplane, updateAirplane} from "./airplane"
import {createUfos} from "./ufo"
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

    // TODO: unfortunately this crashes with "Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
    function gameLost(): void {
        setState(State.GameLost)
    }

    const gameWon = () => {
        setState(State.GameWon)
    }

    // TODO: also be able to drop a few bombs which are slower, have area impact and can kill both the plane and the alien ship!
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

        const camera = new FreeCamera("free-camera", Vector3.Zero(), scene)
        camera.attachControl(canvas, false)

        const ground = await loadMap(scene)
        ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.HeightmapImpostor, { mass: 0 })

        const airplane = await loadAirplane()

        const collisionAirplaneMesh = airplane.children[0] // .root didn't have vertices
        collisionAirplaneMesh.physicsImpostor = new PhysicsImpostor(
            collisionAirplaneMesh,
            PhysicsImpostor.MeshImpostor,
            { mass: 0, friction: 0, restitution: 0 },
            scene,
        )
        collisionAirplaneMesh.physicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main) {
            // TODO: explosion here
            // TODO: This never seems to get triggered
            console.log("boom", main)

            // TODO: show explosion first, only then go to "game lost" screen
            gameLost()
        })

        const ufos = await createUfos(scene)

        const gunshot = new Sound("gunshot", "assets/sounds/cannon.wav", scene, null,
            { playbackRate: 1, volume: 0.1 },
        )

        const createCannonBall = function (airplane: AbstractMesh) {
            const bullet = Mesh.CreateSphere("cannon-ball", 8, 0.1, scene)
            const bulletMaterial = new StandardMaterial("cannon-ball-material", scene)
            bulletMaterial.emissiveColor = Color3.Red()
            bullet.material = bulletMaterial

            bullet.position = airplane.getAbsolutePosition()
            bullet.physicsImpostor = new PhysicsImpostor(
                bullet,
                PhysicsImpostor.SphereImpostor,
                { mass: 1, friction: 0.5, restitution: 0.3 },
                scene,
            )

            const dir = airplane.getDirection(new Vector3(0, 0, 1))
            const power = 100
            bullet.physicsImpostor.applyImpulse(dir.scale(power), airplane.getAbsolutePosition())

            bullet.physicsImpostor.onCollideEvent = (object, target) => {
                if (target === ground.physicsImpostor) {
                    // TODO: show explosion
                    // console.log("collision with ground", ground)
                } else {
                    ufos.forEach((ufo) => {
                        if (target === ufo.sphere.physicsImpostor) {
                            ufo.bulletHit()
                        }
                    })

                    console.log(object, target)
                }

                // TODO: this never seems to trigger
                // if (target === collisionUfoMesh.physicsImpostor) {
                // TODO: show explosion and destroy enemy ship
                //     console.log("collision with ufo", collisionUfoMesh)
                // }

                if (bullet.physicsImpostor) {
                    bullet.physicsImpostor.dispose()
                }

                bullet.dispose()
            }

            gunshot.play()
        }

        scene.registerBeforeRender(() => {
            if (ufos.every((x) => x.destructionFinished())) {
                gameWon()
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
                createCannonBall(airplane.root)
                // TODO: have a lot but not infinite ammo
            }

            const followDirection = new Vector3(0, 0.2, -1)
            const FollowCameraDistance = 20
            camera.position = airplane.root.position.add(airplane.root.getDirection(followDirection).scale(FollowCameraDistance))
            camera.target = airplane.root.position
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
