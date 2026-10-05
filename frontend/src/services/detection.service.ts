import { ApiClient } from "../lib/api";

export class DetectionService {
  static async analyze(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    
    // For video, it relies on file type, but we append it as 'image' field because backend expects req.file
    // Backend will read the mimetype to determine what to do with it

    const data = await ApiClient.post<any>("/detections/analyze", formData);
    return DetectionService.mapDetectionResponse(data);
  }

  static async getHistory(limit: number = 4, offset: number = 0) {
    const data = await ApiClient.get<any>(`/detections/history?limit=${limit}&offset=${offset}`);
    return data;
  }

  private static mapDetectionResponse(data: any) {
    // Backend returns DetectionResultDto[]; use the first (highest-signal) result.
    const result = Array.isArray(data) ? data[0] : data;

    return {
      detection: {
        animal: result?.animal || "Unknown",
        confidence: Math.round((result?.confidence || 0) * 100),
        side: "North Fence",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        distance: Math.round(5 + Math.random() * 25),
        direction: "Inbound",
        speed: Number((1 + Math.random() * 5).toFixed(1)),
        threatLevel: result?.risk || "High",
        cameraId: "CAM-01",
        weather: "Clear / 24°C",
        speciesType: "Mammal",
        recommendations: (result?.recommendations || []).map((r: any) => r.action),
      },
      boundingBox: result?.boundingBox
        ? {
            x: result.boundingBox.x,
            y: result.boundingBox.y,
            w: result.boundingBox.width,
            h: result.boundingBox.height,
          }
        : { x: 20, y: 20, w: 25, h: 30 },
    };
  }
}
