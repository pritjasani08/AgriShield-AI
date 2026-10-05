import io
import base64
import cv2
import numpy as np
import os
import shutil
import time
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from video_predict import process_video

app = FastAPI()

# Mount temp directory to serve processed videos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
temp_dir = os.path.join(BASE_DIR, "temp")
os.makedirs(temp_dir, exist_ok=True)
app.mount("/videos", StaticFiles(directory=temp_dir), name="videos")

# Allow frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

print("Loading model... please wait.")
model_path = os.path.join(BASE_DIR, "models", "best.pt")
model = YOLO(model_path)
print("Model loaded successfully!")

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    # Read image from frontend
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO inference
    results = model.predict(source=img, conf=0.25)
    
    # Check if anything detected
    if not results or len(results[0].boxes) == 0:
        return {"detected": False, "message": "No animal detected"}

    # Get the top detection (highest confidence)
    top_box = results[0].boxes[0]
    class_id = int(top_box.cls[0].item())
    animal_name = results[0].names[class_id]
    confidence = float(top_box.conf[0].item())
    
    # Get annotated image (image with YOLO box drawn on it)
    annotated_img = results[0].plot() 
    
    # Convert image to base64 so frontend can show it directly
    _, buffer = cv2.imencode('.jpg', annotated_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Calculate bounding box (top-left x, y, width, height)
    x1, y1, x2, y2 = top_box.xyxy[0].tolist()
    bbox = {
        "x": int(x1),
        "y": int(y1),
        "width": int(x2 - x1),
        "height": int(y2 - y1)
    }
    
    return {
        "detected": True,
        "animal": animal_name.title(),
        "confidence": round(confidence * 100),
        "bbox": bbox,
        "image_base64": f"data:image/jpeg;base64,{img_base64}"
    }

@app.post("/predict_video")
async def predict_video(video: UploadFile = File(...)):
    # Create temp directory if not exists
    temp_dir = os.path.join(BASE_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Save uploaded video
    input_path = os.path.join(temp_dir, f"upload_{int(time.time())}.mp4")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
        
    output_filename = f"processed_{int(time.time())}.mp4"
    output_path = os.path.join(temp_dir, output_filename)
    
    try:
        # Run high-performance pipeline
        success, detected_animals = process_video(input_path, output_path, batch_size=8)
        
        # Cleanup input
        if os.path.exists(input_path):
            os.remove(input_path)
            
        if not success or not os.path.exists(output_path):
            return JSONResponse(status_code=500, content={"detected": False, "message": "Failed to process video."})
            
        # Analyze results
        if not detected_animals:
            return {"detected": False, "message": "No animal detected in video."}
            
        # Get top detected animal
        top_animal = max(detected_animals, key=detected_animals.get)
        
        return {
            "detected": True,
            "animal": top_animal.title(),
            "confidence": 95, # For video, we don't have a single confidence, send a mock or average
            "video_url": f"http://localhost:8000/videos/{output_filename}"
        }
        
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        return JSONResponse(status_code=500, content={"detected": False, "message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
