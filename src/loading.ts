import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {AbstractMesh, AssetsManager} from "@babylonjs/core"

export function loadMesh(
    assetsManager: AssetsManager,
    taskName: string,
    meshNames: readonly string[],
    rootUrl: string,
    sceneFileName: string,
    initialPosition: Vector3,
    initialRotation: Vector3,
    initialScaling: Vector3,
    loaded: (mesh: AbstractMesh) => void,
): void {
    const task = assetsManager.addMeshTask(
        taskName,
        meshNames,
        rootUrl,
        sceneFileName,
    )

    task.onSuccess = task => {
        const mesh = task.loadedMeshes[0]
        mesh.position = initialPosition
        mesh.rotation = initialRotation
        mesh.scaling = initialScaling

        loaded(mesh)
    }

    task.onError = (task, error) => console.error(task, error)
}
