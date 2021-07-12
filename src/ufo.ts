import {
    Scene,
    SphereBuilder,
    StandardMaterial,
    TransformNode,
} from "@babylonjs/core"
import {Vector3} from "@babylonjs/core/Maths/math.vector"
import {loadMesh, MeshSet} from "./loading"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"
import {Mesh} from "@babylonjs/core/Meshes/mesh"
import {Color3} from "@babylonjs/core/Maths/math.color"
import {EdgeLength, MaxCoordinate, MaxHeight, MinCoordinate} from "./environment"

function r(): number {
    return (Math.random() - 0.5) * 2
}

export class Ufo {
    scene: Scene
    meshSet: TransformNode
    sphere: Mesh
    hitPoints: number
    destructionStarted: number | null

    constructor(_scene: Scene, _meshSet: TransformNode, _sphere: Mesh) {
        this.scene = _scene
        this.meshSet = _meshSet
        this.sphere = _sphere
        this.hitPoints = 5
        this.destructionStarted = null
    }

    bulletHit(): void {
        this.hitPoints = this.hitPoints - 1
    }

    destructionFinished(): boolean {
        if (this.destructionStarted) {
            return (new Date().valueOf() + 1000) > this.destructionStarted
        } else {
            return false
        }
    }

    dropBomb(): void {
        const bomb = SphereBuilder.CreateSphere("ufo-bomb", {diameter: 2}, this.scene)
        const bombMaterial = new StandardMaterial("ufo-bomb-material", this.scene)
        const color = Color3.Red()
        bombMaterial.diffuseColor = color
        bombMaterial.emissiveColor = color
        bombMaterial.specularColor = color
        bomb.material = bombMaterial
        bomb.position = this.sphere.position.subtractFromFloats(0, 3, 0)
        bomb.physicsImpostor = new PhysicsImpostor(
            bomb,
            PhysicsImpostor.SphereImpostor,
            { mass: 10, friction: 0.5, restitution: 0.3 },
            this.scene,
        )

        bomb.physicsImpostor.onCollideEvent = (object, target) => {
            console.log("Bomb hit", object, target)
        }
    }

    update(deltaTime: number): void {
        if (this.destructionStarted) {
            const material = this.sphere.material as StandardMaterial
            const newColor = new Color3(material.emissiveColor.r, material.emissiveColor.g * 0.99, material.emissiveColor.b * 0.99)

            material.emissiveColor = newColor
            material.specularColor = newColor
            material.diffuseColor = newColor
            this.sphere.scaling = this.sphere.scaling.multiplyByFloats(0.99, 0.99, 0.99)
        } else {
            if (this.hitPoints <= 0) { // we just got killed
                this.destructionStarted = new Date().valueOf()
                this.sphere.isVisible = true
                this.meshSet.dispose()
            } else {
                if (this.sphere.position.y < MaxHeight * 1.2) { // if we are too low, go up a bit
                    const force = MaxHeight * 1.2 - this.sphere.position.y
                    this.sphere.applyImpulse(new Vector3(0, Math.random() * force, 0).scale(deltaTime), this.sphere.position)
                }

                if (this.sphere.position.x < MinCoordinate * 0.8) {
                    this.sphere.applyImpulse(new Vector3(10, 0, 0).scale(deltaTime), this.sphere.position)
                }

                if (this.sphere.position.x > MaxCoordinate * 0.8) {
                    this.sphere.applyImpulse(new Vector3(-10, 0, 0).scale(deltaTime), this.sphere.position)
                }

                if (this.sphere.position.z < MinCoordinate * 0.8) {
                    this.sphere.applyImpulse(new Vector3(0, 0, 10).scale(deltaTime), this.sphere.position)
                }

                if (this.sphere.position.z > MaxCoordinate * 0.8) {
                    this.sphere.applyImpulse(new Vector3(0, 0, -10).scale(deltaTime), this.sphere.position)
                }

                this.sphere.applyImpulse(new Vector3(r() * 10, 0, r() * 10).scale(deltaTime), this.sphere.position)

                if (Math.random() < 0.005) { // some probability every tick - note that this is dependent on framerate - should be improved!
                    this.dropBomb()
                }
            }
        }

        this.meshSet.position = this.sphere.position
    }
}

export async function createUfos(scene: Scene, n: number): Promise<Ufo[]> {
    const meshSet = await loadMeshSet();
    [meshSet.root, ...meshSet.children].forEach((x) => { x.isVisible = false })

    return Array.from(Array(n).keys()).map((x) =>
        createUfo(x, scene, meshSet)
    )
}

async function loadMeshSet() {
    return await loadMesh(
        "ufo task",
        ["UFO_body", "UFO_cockpit"],
        "assets/models/ufo/",
        "ufo.glb",
        new Vector3(0, 0, 0),
        new Vector3(0, 0, 0),
        new Vector3(0.1, 0.1, 0.1),
    )
}

function createUfo(index: number, scene: Scene, meshSet: MeshSet<Mesh>): Ufo {
    const x = r() * EdgeLength * 0.5
    const z = r() * EdgeLength * 0.5
    const initialPosition = new Vector3(x, MaxHeight * 1.25, z)

    // .createInstance was a mess, it created some weird hierarchy
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const root = meshSet.root.instantiateHierarchy()!

    root.position = initialPosition

    // this is a sad hack because we could not get MeshImpostor to work
    const ufoBall = SphereBuilder.CreateSphere("ufo-sphere", {diameter: 10}, scene)
    const ufoBallMaterial = new StandardMaterial("ufo-ball-material", scene)
    const color = Color3.Yellow()
    ufoBallMaterial.diffuseColor = color
    ufoBallMaterial.emissiveColor = color
    ufoBallMaterial.specularColor = color
    ufoBall.material = ufoBallMaterial
    ufoBall.position = initialPosition
    ufoBall.isVisible = false
    ufoBall.checkCollisions = true

    ufoBall.physicsImpostor = new PhysicsImpostor(
        ufoBall,
        PhysicsImpostor.SphereImpostor,
        { mass: 1000 },
        scene,
    )

    return new Ufo(scene, root, ufoBall)
}
