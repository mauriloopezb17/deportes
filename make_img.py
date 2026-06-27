import numpy as np
from PIL import Image

# 1.66 MB is about 1.7 million bytes. A 1000x1000 RGB image uncompressed is 3MB.
# We'll make a noisy image to avoid compression so it's large.
arr = np.random.randint(0, 256, (800, 800, 3), dtype=np.uint8)
img = Image.fromarray(arr)
img.save('big.jpg', quality=95)
