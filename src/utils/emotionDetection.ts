
import { pipeline } from "@huggingface/transformers";

// Standard emotion labels that our UI expects
const EMOTION_LABELS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprised', 'neutral'];

// Store the pipeline instance
let emotionClassifier: any = null;

/**
 * Loads the emotion detection model from Hugging Face
 */
export const loadEmotionDetectionModel = async (): Promise<boolean> => {
  try {
    // Load a model that's supported in the browser environment
    // Use a compatible vision transformer model instead of SigLIP
    emotionClassifier = await pipeline(
      "image-classification",
      "Xenova/emotion-recognition-75", // This is a compatible model for browser environment
      { quantized: true } // Use quantized model for better performance
    );
    
    console.log('Emotion detection model loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load emotion detection model:', error);
    return false;
  }
};

/**
 * Creates an image blob from video frame
 * @param videoElement - The video element to capture from
 * @returns A blob URL that can be used with the model
 */
const captureVideoFrame = (videoElement: HTMLVideoElement): string => {
  // Create a canvas element to capture the current frame
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');

  // Set canvas size to match video dimensions
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Calculate face region (center crop of the video)
  const faceSize = Math.min(canvas.width, canvas.height) * 0.7;
  const startX = (canvas.width - faceSize) / 2;
  const startY = (canvas.height - faceSize) / 3; // Move up slightly to better center on the face

  // Draw the current video frame onto the canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // Create a blob from the canvas
  return canvas.toDataURL('image/jpeg');
};

/**
 * Maps the model's output to our UI's expected format
 */
const mapEmotionsToUIFormat = (predictions: any[]): {
  happy: number;
  neutral: number;
  surprised: number;
  sad: number;
  angry: number;
  disgust: number;
  fear: number;
} => {
  // Initialize with zeros
  const result = {
    happy: 0,
    neutral: 0,
    surprised: 0,
    sad: 0,
    angry: 0,
    disgust: 0,
    fear: 0
  };
  
  // Map the predictions to our standard format
  predictions.forEach(prediction => {
    // Convert model's emotion label to lowercase and normalize
    const emotion = prediction.label.toLowerCase();
    
    // Handle different emotion formats
    if (emotion.includes('happy')) {
      result.happy = prediction.score;
    } else if (emotion.includes('neutral')) {
      result.neutral = prediction.score;
    } else if (emotion.includes('surprise')) {
      result.surprised = prediction.score;
    } else if (emotion.includes('sad')) {
      result.sad = prediction.score;
    } else if (emotion.includes('angry') || emotion.includes('anger')) {
      result.angry = prediction.score;
    } else if (emotion.includes('disgust')) {
      result.disgust = prediction.score;
    } else if (emotion.includes('fear')) {
      result.fear = prediction.score;
    }
  });
  
  return result;
};

/**
 * Detects emotion from a video element
 * @param videoElement - The video element containing the face
 * @returns Object with detected emotions and their confidence scores
 */
export const detectEmotion = async (
  videoElement: HTMLVideoElement
): Promise<{ 
  emotion: string; 
  confidence: number; 
  allEmotions: {
    happy: number;
    neutral: number;
    surprised: number;
    sad: number;
    angry: number;
    disgust: number;
    fear: number;
  };
} | null> => {
  if (!emotionClassifier) {
    console.warn('Emotion detection model not loaded');
    return null;
  }

  try {
    // Capture frame from video
    const imageData = captureVideoFrame(videoElement);
    
    // Run inference with the Hugging Face model
    const predictions = await emotionClassifier(imageData);
    
    // Map the predictions to our UI format
    const formattedEmotions = mapEmotionsToUIFormat(predictions);
    
    // Find the emotion with highest confidence
    let topEmotion = { emotion: 'neutral', score: 0 };
    Object.entries(formattedEmotions).forEach(([emotion, score]) => {
      if (score > topEmotion.score) {
        topEmotion = { emotion, score };
      }
    });
    
    // Return the results
    return {
      emotion: topEmotion.emotion,
      confidence: topEmotion.score,
      allEmotions: formattedEmotions
    };
  } catch (error) {
    console.error('Error during emotion detection:', error);
    return null;
  }
};
