import os
import sys
import cv2
import threading
import queue
import time
import json
import torch
from ultralytics import YOLO

from batch_inference import BatchInference
from frame_processor import FrameProcessor
from video_writer import VideoWriterThread
from progress import PipelineProgress
from audio_merger import merge_audio

def print_gpu_info():
    print("=" * 60)
    print("GPU INFERENCE VERIFICATION")
    print("=" * 60)
    if torch.cuda.is_available():
        print(f"CUDA Available: YES")
        print(f"GPU Name: {torch.cuda.get_device_name(0)}")
        print(f"CUDA Version: {torch.version.cuda}")
        print(f"Torch Version: {torch.__version__}")
        
        # Memory
        total_memory = torch.cuda.get_device_properties(0).total_memory / (1024 ** 2)
        print(f"Total GPU Memory: {total_memory:.2f} MB")
    else:
        print(f"CUDA Available: NO")
        print("WARNING: GPU not found. Falling back to CPU inference. Note: Processing will be slower.")
    print("=" * 60)

def video_reader_worker(video_path, frame_queue, progress_tracker):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        frame_queue.put(None)
        return
        
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_queue.put((frame_idx, frame))
        progress_tracker.update_read(1)
        frame_idx += 1
        
    cap.release()
    frame_queue.put(None) # Signal end of stream

def process_video(input_video_path, output_video_path, batch_size=8):
    if not os.path.exists(input_video_path):
        print(f"Error: File {input_video_path} not found.")
        return False, {}

    # Check GPU
    print_gpu_info()
    
    # Initialize Queues
    frame_queue = queue.Queue(maxsize=128)
    inference_queue = queue.Queue(maxsize=128)
    render_queue = queue.Queue(maxsize=128)

    # Load Model
    model_path = os.path.join(os.path.dirname(__file__), "models", "best.pt")
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return False, {}
        
    print(f"\nLoading Model: {model_path}")
    model = YOLO(model_path)
    
    # Ensure it's on appropriate device
    if torch.cuda.is_available():
        model.to('cuda')
    else:
        model.to('cpu')
    
    # Read Video metadata
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened():
        print("Error: Corrupted Video or Unsupported Codec.")
        return False, {}
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    codec_int = int(cap.get(cv2.CAP_PROP_FOURCC))
    codec = "".join([chr((codec_int >> 8 * i) & 0xFF) for i in range(4)])
    duration = total_frames / fps if fps > 0 else 0
    cap.release()
    
    print("\n=" * 60)
    print("VIDEO INFORMATION")
    print("=" * 60)
    print(f"Path: {input_video_path}")
    print(f"Resolution: {width}x{height}")
    print(f"FPS: {fps:.2f}")
    print(f"Total Frames: {total_frames}")
    print(f"Duration: {duration:.2f} seconds")
    print(f"Codec: {codec}")
    print("=" * 60)

    # Initialize Progress Tracker
    progress = PipelineProgress(total_frames)
    
    # Temporary output for video without audio
    temp_output_dir = os.path.join(os.path.dirname(__file__), "temp")
    os.makedirs(temp_output_dir, exist_ok=True)
    temp_video_path = os.path.join(temp_output_dir, "processed_no_audio.mp4")
    
    # We force mp4v codec for standard mp4 output
    output_codec = 'mp4v'
    
    # Initialize Workers
    # 1. Reader Thread
    reader_thread = threading.Thread(target=video_reader_worker, args=(input_video_path, frame_queue, progress))
    
    # 2. GPU Inference
    batch_inference = BatchInference(model, frame_queue, inference_queue, progress, fps, initial_batch_size=batch_size)
    
    # 3. CPU Render Workers
    num_cpu_workers = max(1, os.cpu_count() - 2)
    frame_processor = FrameProcessor(inference_queue, render_queue, progress, num_workers=num_cpu_workers)
    
    # 4. Video Writer Thread
    writer_thread = VideoWriterThread(temp_video_path, fps, width, height, output_codec, render_queue, progress)

    # Start Pipeline
    print("\nStarting High-Performance Video Pipeline...")
    reader_thread.start()
    frame_processor.start()
    writer_thread.start()
    
    # Run GPU Inference in main thread
    batch_inference.run()
    
    # Wait for completion
    reader_thread.join()
    frame_processor.wait()
    writer_thread.join()
    
    progress.finish()
    
    # Aggregate JSON results
    predictions_dir = os.path.join(os.path.dirname(__file__), "predictions")
    os.makedirs(predictions_dir, exist_ok=True)
    json_output_path = os.path.join(predictions_dir, "results.json")
    
    all_json_data = []
    # frame_processor doesn't accumulate to save memory, we can optionally pass it back. 
    # Since we want JSON output, we should modify VideoWriterThread to collect it.
    
    # Merge Audio
    success = merge_audio(input_video_path, temp_video_path, output_video_path)
    if success and os.path.exists(temp_video_path):
        os.remove(temp_video_path)
        
    # Summary
    print("\n" + "=" * 60)
    print("PROCESSING SUMMARY")
    print("=" * 60)
    print(f"Total Frames Processed: {progress.encoded_frames}")
    total_time = time.time() - progress.start_time
    print(f"Total Processing Time: {total_time:.2f} seconds")
    print(f"Average Pipeline FPS: {progress.encoded_frames / total_time:.2f}")
    
    if batch_inference.total_processing_time > 0:
        print(f"Average Inference Time per Frame: {(batch_inference.total_processing_time / progress.encoded_frames)*1000:.2f} ms")
        
    print(f"Maximum GPU Memory Allocated: {batch_inference.max_gpu_memory:.2f} MB")
    
    print("\nDetected Animals Breakdown:")
    if not batch_inference.detected_animals_count:
        print("  None")
    else:
        for name, count in batch_inference.detected_animals_count.items():
            print(f"  - {name}: {count} detections")
    print("=" * 60)
    print(f"Successfully generated: {output_video_path}")
    
    return True, batch_inference.detected_animals_count
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="YOLO11 High-Performance Video Detection Pipeline")
    parser.add_argument("input", help="Path to input video file")
    parser.add_argument("--output", default="processed_video.mp4", help="Path to output video file")
    parser.add_argument("--batch", type=int, default=8, help="Batch size for GPU inference")
    
    args = parser.parse_args()
    
    try:
        process_video(args.input, args.output, args.batch)
    except KeyboardInterrupt:
        print("\n[!] Processing interrupted by user. Cleaning up...")
        sys.exit(0)
    except Exception as e:
        print(f"\n[!] Fatal Error: {e}")
        sys.exit(1)
