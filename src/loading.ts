import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {AbstractMesh, SceneLoader} from "@babylonjs/core"

export interface MeshSet {
    root: AbstractMesh,
    children: readonly AbstractMesh[],
}

export async function loadMesh(
    taskName: string,
    meshNames: readonly string[],
    rootUrl: string,
    sceneFileName: string,
    initialPosition: Vector3,
    initialRotation: Vector3,
    initialScaling: Vector3,
): Promise<MeshSet> {
    SceneLoader.ShowLoadingScreen = true
    const result = await SceneLoader.ImportMeshAsync(null, rootUrl, sceneFileName)
    const root = result.meshes[0]
    const children = root.getChildMeshes()
    root.position = initialPosition
    root.rotation = initialRotation
    root.scaling = initialScaling;

    [root, ...children].forEach((x) => {
        x.receiveShadows = true
        x.checkCollisions = true
    })
    return {
        root: root,
        children: children
    }
}
