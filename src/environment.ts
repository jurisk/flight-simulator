import {Color3} from "@babylonjs/core/Maths/math.color"
import {
    GroundMesh,
    HemisphericLight,
    MeshBuilder,
    PointLight,
    Scene,
    Scene as BabylonScene, StandardMaterial,
    Vector3
} from "@babylonjs/core"
import {Texture} from "@babylonjs/core/Materials/Textures/texture"

export function fogSkyLight(scene: Scene): void {
    const SkyBlue = Color3.FromHexString("#77B5FE")
    scene.clearColor = SkyBlue.toColor4(1)
    scene.fogEnabled = true
    scene.fogMode = BabylonScene.FOGMODE_EXP2
    scene.fogDensity = 0.002
    scene.fogColor = SkyBlue

    new PointLight("directional-light", new Vector3(-1, -1, 0), scene)

    const hemiLight = new HemisphericLight("hemi-light", new Vector3(0, 1, 0), scene)
    hemiLight.intensity = 0.25
}

export function loadMap(scene: Scene): Promise<GroundMesh> {
    return new Promise<GroundMesh>((resolve) => {
        const edgeLength = 1000
        const map = MeshBuilder.CreateGroundFromHeightMap("map", "assets/textures/worldHeightMap.jpeg", {
            width: edgeLength,
            height: edgeLength,
            subdivisions: 256,
            minHeight: 0,
            maxHeight: 50,
            updatable: false,
            onReady: (x) => resolve(x)
        }, scene)
        const mapMaterial = new StandardMaterial("map-material", scene)
        mapMaterial.diffuseTexture = new Texture("assets/textures/earth.jpeg", scene)
        map.material = mapMaterial
    })
}
