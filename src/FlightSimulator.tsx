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

const onSceneReady = (scene: Scene) => {
    scene.debugLayer.show({ embedMode: true }).catch((x) => console.error(x))

    const engine = scene.getEngine()
    const canvas = engine.getRenderingCanvas()

    const SkyBlue = Color3.FromHexString("#87ceeb")
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

    airplaneTask.onError = (task, error) => console.error(task, error)

    scene.registerBeforeRender(() => {
        if (airplane) {
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
