# unpack the model into .gltf, .bin, and texture files in the tmp/ directory
mkdir tmp
gltf-pipeline -i input.glb -o tmp/tmp.gltf --separate --json

# optimize the textures in tmp/
# e.g. https://compresspng.com/ or https://squoosh.app/

# re-pack the model into a GLB, adding Draco compression
gltf-pipeline -i tmp/tmp.gltf -o optimized.glb --binary --draco
