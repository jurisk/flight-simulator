import React from "react"
import {
    Vector3,
    Scene,
    ArcRotateCamera,
    PointLight,
    AssetsManager, HemisphericLight, Scene as BabylonScene, AbstractMesh, MeshBuilder, StandardMaterial,
} from "@babylonjs/core"
import SceneComponent from "babylonjs-hook"
import "./App.css"
import "@babylonjs/loaders/glTF"
import {Color3} from "@babylonjs/core/Maths/math.color"
import "@babylonjs/inspector"
import {Nullable} from "@babylonjs/core/types"
import {Texture} from "@babylonjs/core/Materials/Textures/texture"
import {newPressedKeys, PressedKeys, updateKeys} from "./keys"
import {Controls, updateControls} from "./controls"
import {loadAirplane, updateAirplane} from "./airplane"
import {loadUfo, updateUfo} from "./ufo"

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

    const SkyBlue = Color3.FromHexString("#77B5FE")
    scene.clearColor = SkyBlue.toColor4(1)
    scene.fogEnabled = true
    scene.fogMode = BabylonScene.FOGMODE_EXP2
    scene.fogDensity = 0.002
    scene.fogColor = SkyBlue

    new PointLight("directional-light", new Vector3(-1, -1, 0), scene)

    const hemiLight = new HemisphericLight("hemi-light", new Vector3(0, 1, 0), scene)
    hemiLight.intensity = 0.25

    const camera = new ArcRotateCamera("arc-rotate-camera", 0, 0.8, 100, Vector3.Zero(), scene)
    camera.attachControl(canvas, false)

    const assetsManager = new AssetsManager(scene)

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

    const edgeLength = 1000
    const map = MeshBuilder.CreateGroundFromHeightMap("map", "assets/textures/worldHeightMap.jpeg", {
        width: edgeLength,
        height: edgeLength,
        subdivisions: 256,
        minHeight: 0,
        maxHeight: 40,
    }, scene)
    const mapMaterial = new StandardMaterial("map-material", scene)
    mapMaterial.diffuseTexture = new Texture("assets/textures/earth.jpeg", scene)
    map.material = mapMaterial

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
