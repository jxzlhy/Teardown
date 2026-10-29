import bpy, sys, os

# Blender headless: USDZ -> GLB（Apple 官网 AR 资产的标准转换路径）
# usage: /Applications/Blender.app/Contents/MacOS/Blender --background --python tools/usd2glb.py -- <src.usdz> <dst.glb>
argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if len(argv) < 2:
    print("usage: Blender --background --python tools/usd2glb.py -- <src.usdz> <dst.glb>")
    sys.exit(1)

def safe_path(p, must_exist=False):
    """CLI 路径守卫：拒绝 .. 穿越，规范化为绝对路径；输入须存在，输出父目录须存在"""
    if not p or '..' in p.replace('\\', '/').split('/'):
        raise SystemExit('bad path (.. rejected): %s' % p)
    ap = os.path.abspath(os.path.expanduser(p))
    if must_exist and not os.path.isfile(ap):
        raise SystemExit('input not found: %s' % ap)
    if not must_exist and not os.path.isdir(os.path.dirname(ap)):
        raise SystemExit('output dir not found: %s' % os.path.dirname(ap))
    return ap

src = safe_path(argv[0], must_exist=True)
dst = safe_path(argv[1])

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.wm.usd_import(filepath=src)

meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
tris = sum(len(o.data.polygons) for o in meshes)
mats = set()
for o in meshes:
    for s in o.material_slots:
        if s.material: mats.add(s.material.name)

# Blender 版本间导出参数有差异：先用完整参数，不被识别就回退最小安全集
try:
    bpy.ops.export_scene.gltf(
        filepath=dst,
        export_format='GLB',
        export_yup=True,
        export_image_format='AUTO',
        export_materials='EXPORT',
        export_texcoords=True,
        export_normals=True,
        export_colors='NONE',
        export_cameras=False,
        export_lights=False,
    )
except TypeError:
    bpy.ops.export_scene.gltf(
        filepath=dst,
        export_format='GLB',
        export_yup=True,
        export_image_format='AUTO',
        export_texcoords=True,
        export_normals=True,
    )

print("RESULT meshes=%d tris=%d materials=%d src=%s dst=%s size=%.2fMB" % (
    len(meshes), tris, len(mats), os.path.basename(src), dst, os.path.getsize(dst)/1e6))
