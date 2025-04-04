
import * as tf from '@tensorflow/tfjs';

// Labels for the emotions our model can detect - mapping to what the UI expects
const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];
const UI_EMOTION_KEYS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprised', 'neutral'];

let model: tf.LayersModel | null = null;

/**
 * Loads the emotion detection model
 */
export const loadEmotionDetectionModel = async (): Promise<boolean> => {
  try {
    // Load the model
    model = await tf.loadLayersModel('/emotion_detector.json');
    
    // Warm up the model with a dummy tensor to ensure it's ready
    const dummyTensor = tf.zeros([1, 48, 48, 1]);
    model.predict(dummyTensor);
    dummyTensor.dispose();
    
    console.log('Emotion detection model loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load emotion detection model:', error);
    return false;
  }
};

/**
 * Preprocesses an image for the emotion detection model
 * @param imageData - The image data from canvas or video frame
 * @returns A tensor ready for model prediction
 */
const preprocessImage = (imageData: ImageData): tf.Tensor => {
  return tf.tidy(() => {
    // Convert ImageData to tensor
    const tensor = tf.browser.fromPixels(imageData);
    
    // Resize to model input size
    const resized = tf.image.resizeBilinear(tensor, [48, 48]);
    
    // Convert to grayscale (for emotion recognition)
    const grayscale = resized.mean(2).expandDims(2);
    
    // Enhance contrast
    const meanVal = grayscale.mean();
    const normalized = grayscale.sub(meanVal).div(tf.scalar(255.0)).add(0.5);
    
    // Add batch dimension
    return normalized.expandDims(0);
  });
};

/**
 * Maps the model's output to the UI's expected emotion format
 * @param emotionScores - The raw scores from the model
 * @returns An object with the standard emotion keys expected by the UI
 */
const mapEmotionsToUIFormat = (emotionScores: Float32Array): {
  happy: number;
  neutral: number;
  surprised: number;
  sad: number;
  angry: number;
  disgust: number;
  fear: number;
} => {
  const emotionMap: Record<string, number> = {};
  
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
  
  // Map the model output to corresponding UI keys
  EMOTION_LABELS.forEach((label, index) => {
    const uiKey = UI_EMOTION_KEYS[index];
    emotionMap[uiKey] = emotionScores[index];
  });
  
  // Assign values to the result object
  Object.keys(result).forEach(key => {
    if (emotionMap[key] !== undefined) {
      result[key as keyof typeof result] = emotionMap[key];
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
  if (!model) {
    console.warn('Emotion detection model not loaded');
    return null;
  }

  try {
    // Create a canvas element to capture the current frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Set canvas size to match video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Calculate face region (center crop of the video)
    const faceSize = Math.min(canvas.width, canvas.height) * 0.7;
    const startX = (canvas.width - faceSize) / 2;
    const startY = (canvas.height - faceSize) / 3; // Move up slightly to better center on the face

    // Draw the current video frame onto the canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get the image data - focus on the face region for better accuracy
    const imageData = context.getImageData(startX, startY, faceSize, faceSize);

    // Preprocess the image data for the model
    const tensor = preprocessImage(imageData);

    // Make prediction
    const predictions = await model.predict(tensor) as tf.Tensor;
    
    // Get the results
    const emotionScores = await predictions.data();
    
    // Map emotions to UI format
    const formattedEmotions = mapEmotionsToUIFormat(emotionScores as Float32Array);
    
    // Convert to array of label-score pairs for finding the top emotion
    const emotionsWithScores = Object.entries(formattedEmotions).map(([emotion, score]) => ({
      emotion,
      score
    }));
    
    // Sort by score (highest first)
    emotionsWithScores.sort((a, b) => b.score - a.score);
    
    // Clean up tensors
    tensor.dispose();
    predictions.dispose();
    
    // Return the top emotion with its confidence
    return {
      emotion: emotionsWithScores[0].emotion,
      confidence: emotionsWithScores[0].score,
      allEmotions: formattedEmotions
    };
  } catch (error) {
    console.error('Error during emotion detection:', error);
    return null;
  }
};
