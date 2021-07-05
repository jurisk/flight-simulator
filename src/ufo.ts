import {Scene, SphereBuilder} from "@babylonjs/core"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {loadMesh, MeshSet} from "./loading"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"
import {Mesh} from "@babylonjs/core/Meshes/mesh"

class Ufo {
    meshSet: MeshSet
    sphere: Mesh
    hitpoints: number

    constructor(_meshSet: MeshSet, _sphere: Mesh) {
        this.meshSet = _meshSet
        this.sphere = _sphere
        this.hitpoints = 10
    }

    update(deltaTime: number) {
        this.meshSet.root.position = this.sphere.position
    }
}

export const loadUfo = (scene: Scene): Promise<Ufo> => {
    const initialPosition = new Vector3(60, 40, 60)

    return loadMesh(
        "ufo task",
        ["UFO_body", "UFO_cockpit"],
        "assets/models/ufo/",
        "ufo.glb",
        initialPosition,
        new Vector3(0, 0, 0),
        new Vector3(0.1, 0.1, 0.1),
    ).then((x) => {
        // this is a sad hack because we could not get MeshImpostor to work
        const ufoBall = SphereBuilder.CreateSphere("ufo-sphere", {diameter: 10})
        ufoBall.position = initialPosition
        ufoBall.isVisible = false
        ufoBall.checkCollisions = true

        ufoBall.physicsImpostor = new PhysicsImpostor(
            ufoBall,
            PhysicsImpostor.SphereImpostor,
            { mass: 0 },
            scene,
        )

        return new Ufo(x, ufoBall)
    })
}
