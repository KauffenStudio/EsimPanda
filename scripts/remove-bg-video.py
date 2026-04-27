#!/usr/bin/env python3
"""Remove background from video and export as WebM with alpha transparency."""

import os
import sys
import subprocess
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import remove, new_session

# Paths
INPUT_VIDEO = Path(__file__).parent.parent / "public" / "bambu" / "hero intro.mp4"
OUTPUT_VIDEO = Path(__file__).parent.parent / "public" / "bambu" / "hero-intro.webm"
FFMPEG_BIN = subprocess.check_output(
    [sys.executable, "-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"],
    text=True
).strip()

def main():
    print(f"Input: {INPUT_VIDEO}")
    print(f"Output: {OUTPUT_VIDEO}")
    print(f"FFmpeg: {FFMPEG_BIN}")

    # Open video
    cap = cv2.VideoCapture(str(INPUT_VIDEO))
    if not cap.isOpened():
        print("ERROR: Cannot open video")
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video: {width}x{height} @ {fps}fps, {total_frames} frames")

    # Create rembg session (reuse for performance)
    session = new_session("u2net")

    # Process frames to temp directory
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Temp dir: {tmpdir}")

        for i in range(total_frames):
            ret, frame = cap.read()
            if not ret:
                break

            # Convert BGR to RGB for rembg
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)

            # Remove background - returns RGBA
            result = remove(pil_img, session=session)

            # Save as PNG with alpha
            out_path = os.path.join(tmpdir, f"frame_{i:05d}.png")
            result.save(out_path, "PNG")

            progress = (i + 1) / total_frames * 100
            print(f"\rProcessing: {i+1}/{total_frames} ({progress:.1f}%)", end="", flush=True)

        cap.release()
        print("\n\nEncoding to WebM with alpha...")

        # Encode to WebM VP9 with alpha channel
        cmd = [
            FFMPEG_BIN,
            "-y",
            "-framerate", str(fps),
            "-i", os.path.join(tmpdir, "frame_%05d.png"),
            "-c:v", "libvpx-vp9",
            "-pix_fmt", "yuva420p",
            "-b:v", "2M",
            "-auto-alt-ref", "0",
            "-an",
            str(OUTPUT_VIDEO)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"FFmpeg error:\n{result.stderr}")
            sys.exit(1)

        size_mb = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
        print(f"Done! Output: {OUTPUT_VIDEO} ({size_mb:.1f}MB)")

if __name__ == "__main__":
    main()
