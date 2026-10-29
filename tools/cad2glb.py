#!/usr/bin/env python3
"""CAD -> GLB converter.
step: gmsh(OCC) 读 STEP，按体积实体（STEP 产品名）分组三角化，导出 GLB（每部件一个 node）
stl : 二进制 STL -> 单 mesh GLB
依赖：pip3 install gmsh（step 模式）；stl 模式零依赖
usage:
  python3 tools/cad2glb.py step <in.stp> <out.glb> [meshSizeMax_mm]
  python3 tools/cad2glb.py stl  <in.stl> <out.glb>
"""
import sys, os, json, struct, re

# CLI 目标（__main__ 中赋值；函数内部统一经 clean_in_path/clean_out_path 消毒后使用）
SRC = ''
DST = ''

def safe_path(p, must_exist=False):
    """CLI 路径守卫：拒绝 .. 穿越，realpath 解析符号链接；
    输入须存在，输出必须位于当前工作目录内且父目录须存在"""
    if not p or '..' in p.replace('\\', '/').split('/'):
        raise SystemExit('✗ 路径不合法（禁止 .. 穿越）: %s' % p)
    ap = os.path.abspath(os.path.expanduser(p))
    if must_exist:
        rp = os.path.realpath(ap)
        if not os.path.isfile(rp):
            raise SystemExit('✗ 输入文件不存在: %s' % rp)
        return rp
    rp = os.path.realpath(ap)
    root = os.path.realpath(os.getcwd())
    if not (rp == root or rp.startswith(root + os.sep)):
        raise SystemExit('✗ 输出必须位于当前工作目录内: %s' % rp)
    if not os.path.isdir(os.path.dirname(rp)):
        raise SystemExit('✗ 输出目录不存在: %s' % os.path.dirname(rp))
    return rp

def clean_in_path(p):
    """输入路径消毒：拒绝 .. 穿越，realpath 解析符号链接，要求文件存在（单出口）。"""
    ap = os.path.realpath(os.path.abspath(os.path.expanduser(p)))
    if not p or '..' in p.replace('\\', '/').split('/') or not os.path.isfile(ap):
        raise SystemExit('✗ 输入文件不存在或路径不合法: %s' % p)
    return ap

def clean_out_path(dst):
    """输出路径消毒：以 cwd 为根、逐段白名单重建（阻断符号链接与注入字符），
    供 write_glb 在 open 前重写路径，确保写入不可离开工作目录。"""
    root = os.path.realpath(os.getcwd())
    rel = os.path.relpath(os.path.realpath(os.path.abspath(os.path.expanduser(dst))), root)
    if rel == os.pardir or rel.startswith(os.pardir + os.sep):
        raise SystemExit('✗ 输出必须位于当前工作目录内: %s' % dst)
    parts = rel.split(os.sep)
    for seg in parts:
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', seg):
            raise SystemExit('✗ 输出路径含不合法字符: %r' % seg)
    return os.path.join(root, *parts)

def push(bv, buf, data, align=4):
    while len(buf) % align: buf.append(0)
    bv.append({ 'buffer': 0, 'byteOffset': len(buf), 'byteLength': len(data) })
    buf.extend(data)
    return len(bv) - 1

def write_glb(dst, nodes):
    """nodes: [{name, positions:[floats], tris:[ints], color:[r,g,b]}]"""
    dst = clean_out_path(dst)
    buffer = bytearray(); bufferViews = []; accessors = []; meshes = []; materials = []; mat_idx = {}
    for n in nodes:
        pos = n['positions']; tris = n['tris']
        if not tris: continue
        # 法线：面积加权累计
        acc = [0.0]*(len(pos))
        norms = [ [0.0,0.0,0.0] for _ in range(len(pos)//3) ]
        for i in range(0, len(tris), 3):
            a,b,c = tris[i]*3, tris[i+1]*3, tris[i+2]*3
            ux,uy,uz = pos[b]-pos[a], pos[b+1]-pos[a+1], pos[b+2]-pos[a+2]
            vx,vy,vz = pos[c]-pos[a], pos[c+1]-pos[a+1], pos[c+2]-pos[a+2]
            nx,ny,nz = uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx
            for vi in (a,b,c):
                norms[vi//3][0]+=nx; norms[vi//3][1]+=ny; norms[vi//3][2]+=nz
        nrm = []
        for v in norms:
            l = (v[0]*v[0]+v[1]*v[1]+v[2]*v[2])**0.5
            if l < 1e-9: nrm.extend([0,0,1])
            else: nrm.extend([v[0]/l, v[1]/l, v[2]/l])
        pv = push(bufferViews, buffer, struct.pack('<%df' % len(pos), *pos))
        mn = [min(pos[i::3]) for i in range(3)]; mx = [max(pos[i::3]) for i in range(3)]
        accessors.append({ 'bufferView': pv, 'componentType': 5126, 'count': len(pos)//3, 'type': 'VEC3', 'min': mn, 'max': mx })
        pa = len(accessors)-1
        nv = push(bufferViews, buffer, struct.pack('<%df' % len(nrm), *nrm))
        accessors.append({ 'bufferView': nv, 'componentType': 5126, 'count': len(nrm)//3, 'type': 'VEC3' }); na = len(accessors)-1
        iv = push(bufferViews, buffer, struct.pack('<%dI' % len(tris), *tris), align=4)
        accessors.append({ 'bufferView': iv, 'componentType': 5125, 'count': len(tris), 'type': 'SCALAR' }); ia = len(accessors)-1
        col = tuple(n.get('color', (0.62, 0.65, 0.68)))
        if col not in mat_idx:
            materials.append({ 'name': 'm%d' % len(materials), 'pbrMetallicRoughness': { 'baseColorFactor': [*col, 1.0], 'metallicFactor': 0.85, 'roughnessFactor': 0.42 }, 'doubleSided': True })
            mat_idx[col] = len(materials)-1
        meshes.append({ 'name': n['name'][:48], 'primitives': [{ 'attributes': { 'POSITION': pa, 'NORMAL': na }, 'indices': ia, 'material': mat_idx[col] }] })
    nodes_g = [{ 'mesh': i, 'name': m['name'] } for i, m in enumerate(meshes)]
    glb = {
        'asset': { 'version': '2.0', 'generator': 'cad2glb.py' }, 'scene': 0,
        'scenes': [ { 'nodes': list(range(len(nodes_g))) } ],
        'nodes': nodes_g, 'meshes': meshes, 'materials': materials,
        'accessors': accessors, 'bufferViews': bufferViews,
        'buffers': [ { 'byteLength': len(buffer) } ],
    }
    jb = json.dumps(glb, separators=(',', ':')).encode()
    while len(jb) % 4: jb += b' '
    while len(buffer) % 4: buffer.append(0)
    total = 12 + 8 + len(jb) + 8 + len(buffer)
    fd = os.open(dst, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o644)
    with os.fdopen(fd, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(jb), 0x4E4F534A)); f.write(jb)
        f.write(struct.pack('<II', len(buffer), 0x004E4942)); f.write(buffer)
    print('CONVERTED %s parts=%d tris=%d size=%.1fMB' % (
        dst, len(meshes), sum(len(m['tris'])//3 for m in nodes), os.path.getsize(dst)/1e6))

def hexc(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i+2], 16)/255 for i in (0, 2, 4))

# 名称调色：按实体名关键词猜材质色（CAD 资产无贴图、产品名多为泛名）
PALETTE = [
    ('keyboard', hexc('22262c')), ('key', hexc('22262c')),
    ('battery', hexc('2a2d33')), ('cell', hexc('2a2d33')),
    ('board', hexc('1d4a34')), ('pcb', hexc('1d4a34')), ('main', hexc('1d4a34')),
    ('display', hexc('0b0e13')), ('panel', hexc('0b0e13')), ('lcd', hexc('0b0e13')),
    ('hinge', hexc('8f979e')), ('speaker', hexc('15181d')),
    ('touchpad', hexc('35393f')), ('fan', hexc('3a3f46')),
    ('cover', hexc('b7bec6')), ('top', hexc('b7bec6')), ('bottom', hexc('a8afb7')),
    ('shell', hexc('b7bec6')), ('frame', hexc('9aa1a9')), ('bezel', hexc('2c3038')),
]
def color_of(name):
    ln = (name or '').lower()
    for kw, c in PALETTE:
        if kw in ln: return c
    return (0.62, 0.65, 0.68)

def do_step(mesh_max=2.2):
    src = clean_in_path(SRC)
    dst = clean_out_path(DST)
    import gmsh
    gmsh.initialize()
    gmsh.option.setNumber('General.Terminal', 0)
    gmsh.option.setNumber('Geometry.OCCImportLabels', 1)
    gmsh.merge(src)
    gmsh.option.setNumber('Mesh.MeshSizeMax', float(mesh_max))
    gmsh.option.setNumber('Mesh.MeshSizeMin', 0.4)
    gmsh.option.setNumber('Mesh.Algorithm', 6)
    gmsh.model.mesh.generate(2)
    nodeTags, coords, _ = gmsh.model.mesh.getNodes()
    xyz = { int(t): (coords[3*i], coords[3*i+1], coords[3*i+2]) for i, t in enumerate(nodeTags) }
    nodes = []; skipped = 0
    for dim, tag in gmsh.model.getEntities(3):
        name = gmsh.model.getEntityName(dim, tag) or ('SOLID_%d' % tag)
        surfs = [s for s in gmsh.model.getBoundary([(dim, tag)], oriented=False)]
        positions = []; vmap = {}; tris = []
        for sd, st in surfs:
            etypes, etags, enodes = gmsh.model.mesh.getElements(sd, st)
            for et, en in zip(etypes, enodes):
                if et != 2: continue  # 三角形
                ens = [int(x) for x in en]
                for k in range(0, len(ens), 3):
                    tri = []
                    for nt in ens[k:k+3]:
                        if nt not in vmap:
                            vmap[nt] = len(positions)//3
                            p = xyz.get(nt)
                            if p is None: p = (0,0,0)
                            positions.extend(p)
                        tri.append(vmap[nt])
                    a,b,c = tri
                    if a==b or b==c or a==c: skipped += 1; continue
                    tris.extend(tri)
        if tris:
            nodes.append({ 'name': name, 'positions': positions, 'tris': tris, 'color': color_of(name) })
        else:
            skipped += 1
    gmsh.finalize()
    print('parts=%d skipped=%d names: %s' % (len(nodes), skipped, ' | '.join(n['name'][:24] for n in nodes[:24])))
    write_glb(dst, nodes)

def do_stl():
    src = clean_in_path(SRC)
    dst = clean_out_path(DST)
    fd = os.open(src, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, 'rb') as f:
        buf = f.read()
    n = struct.unpack('<I', buf[80:84])[0]
    positions = []; tris = []
    off = 84
    for i in range(n):
        rec = buf[off:off+50]; off += 50
        vals = struct.unpack('<12fH', rec)
        base = len(positions)//3
        for k in range(3):
            positions.extend([vals[3+3*k], vals[4+3*k], vals[5+3*k]])
        tris.extend([base, base+1, base+2])
    write_glb(dst, [{ 'name': 'SHELL', 'positions': positions, 'tris': tris, 'color': (0.88, 0.86, 0.82) }])

if __name__ == '__main__':
    mode = sys.argv[1]
    SRC = sys.argv[2]
    DST = sys.argv[3]
    mesh_max = 2.2
    if len(sys.argv) > 4:
        mesh_max = float(sys.argv[4])
    if mode == 'step':
        do_step(mesh_max)
    else:
        do_stl()
