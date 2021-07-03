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
import {updateAirplane} from "./airplane"
import {updateUfo} from "./ufo"

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
    const airplaneTask = assetsManager.addMeshTask(
        "f15 task",
        ["F_15_C", "GLass", "TAnks"],
        "assets/models/f15/",
        "f15.gltf",
    )

    const ufoTask = assetsManager.addMeshTask(
        "ufo task",
        ["UFO_body", "UFO_cockpit"],
        "assets/models/ufo/",
        "ufo.glb",
    )

    const initialAirplanePosition = new Vector3(0, 10, 10)
    const initialAirplaneRotation = new Vector3(0, Math.PI * (7/8), 0)

    let airplane: Nullable<AbstractMesh> = null
    airplaneTask.onSuccess = task => {
        airplane = task.loadedMeshes[0]
        airplane.position = initialAirplanePosition
        airplane.rotation = initialAirplaneRotation

        const followDirection = new Vector3(0, 0.2, -1)
        const FollowCameraDistance = 20
        camera.position = airplane.position.add(airplane.getDirection(followDirection).scale(FollowCameraDistance))
    }
    airplaneTask.onError = (task, error) => console.error(task, error)

    const initialUfoPosition = new Vector3(20, 20, 20)
    const initialUfoRotation = new Vector3(0, 0, 0)

    let ufo: Nullable<AbstractMesh> = null
    ufoTask.onSuccess = task => {
        console.log(task)
        ufo = task.loadedMeshes[0]
        ufo.scaling = new Vector3(0.1, 0.1, 0.1)
        ufo.position = initialUfoPosition
        ufo.rotation = initialUfoRotation
    }
    ufoTask.onError = (task, error) => console.error(task, error)

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
