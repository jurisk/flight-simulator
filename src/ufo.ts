import {AbstractMesh, Scene, SphereBuilder, StandardMaterial} from "@babylonjs/core"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {loadMesh, MeshSet} from "./loading"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"
import {Mesh} from "@babylonjs/core/Meshes/mesh"
import {Color3} from "@babylonjs/core/Maths/math.color"

class Ufo {
    meshSet: MeshSet
    sphere: Mesh
    hitpoints: number
    destructionStarted: number | null

    constructor(_meshSet: MeshSet, _sphere: Mesh) {
        this.meshSet = _meshSet
        this.sphere = _sphere
        this.hitpoints = 5
        this.destructionStarted = null
    }

    bulletHit() {
        this.hitpoints = this.hitpoints - 1
    }

    update(deltaTime: number) {
        if (this.destructionStarted) {
            this.sphere.scaling = this.sphere.scaling.multiplyByFloats(0.99, 0.99, 0.99)
        } else {
            if (this.hitpoints <= 0) {
                this.destructionStarted = new Date().valueOf()
                this.sphere.isVisible = true;
                ([this.meshSet.root, ...this.meshSet.children])
                    .forEach((x: AbstractMesh) => {x.isVisible = false})
            }
        }

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
        const ufoBall = SphereBuilder.CreateSphere("ufo-sphere", {diameter: 10}, scene)
        const ufoBallMaterial = new StandardMaterial("ufo-ball-material", scene)
        ufoBallMaterial.emissiveColor = Color3.Yellow()
        ufoBallMaterial.specularColor = Color3.Yellow()
        ufoBall.material = ufoBallMaterial
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
