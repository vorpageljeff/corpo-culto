from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

SOURCE = Path('/tmp/cc-full-demo.png')
OUTPUT = Path(__file__).with_name('apresentacao-corpo-culto.mp4')
FPS = 30
WIDTH, HEIGHT = 1280, 720

page = Image.open(SOURCE).convert('RGB')
source_w, source_h = page.size
crop_h = round(source_w * HEIGHT / WIDTH)
max_y = source_h - crop_h

segments = [
    # duração, início, fim — pausas e movimentos próprios para acompanhar uma narração
    (5.0, 0, 120),
    (4.0, 120, 780),
    (5.0, 780, 1050),
    (8.0, 1050, 2200),
    (5.0, 2200, 2750),
    (8.0, 2750, 3500),
    (6.0, 3500, 4050),
    (3.0, 4050, 4050),
]


def smoothstep(value: float) -> float:
    return value * value * (3 - 2 * value)


def frame_at(y: float) -> Image.Image:
    y = max(0, min(int(y), max_y))
    crop = page.crop((0, y, source_w, y + crop_h))
    return crop.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


writer = imageio_ffmpeg.write_frames(
    str(OUTPUT),
    (WIDTH, HEIGHT),
    fps=FPS,
    codec='libx264',
    quality=7,
    pix_fmt_in='rgb24',
    pix_fmt_out='yuv420p',
    output_params=['-movflags', '+faststart'],
)
writer.send(None)

for duration, start_y, end_y in segments:
    count = round(duration * FPS)
    for index in range(count):
        progress = index / max(count - 1, 1)
        y = start_y + (end_y - start_y) * smoothstep(progress)
        writer.send(frame_at(y).tobytes())

writer.close()
print(OUTPUT)
