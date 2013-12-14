import os.path
import glob
import subprocess

for src_mesh in glob.glob('../assets_src/*.obj'):
    bn = os.path.basename(src_mesh)
    root, ext = os.path.splitext(bn)
    tgt_mesh = root + '.js'
    print("Converting {} -> {}".format(src_mesh, tgt_mesh))
    subprocess.call(["python", "../convert_obj_three.py", "-i", src_mesh, "-o", tgt_mesh])
