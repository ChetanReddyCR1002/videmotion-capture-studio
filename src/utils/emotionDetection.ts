
import * as tf from '@tensorflow/tfjs';

// Labels for the emotions our model can detect
const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];

let model: tf.LayersModel | null = null;

/**
 * Loads the emotion detection model
 */
export const loadEmotionDetectionModel = async (): Promise<boolean> => {
  try {
    // Convert and load the h5 model
    model = await tf.loadLayersModel('/emotion_detector.json');
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
  // Convert ImageData to tensor
  const tensor = tf.browser.fromPixels(imageData);
  
  // Resize to model input size (48x48 is common for emotion models)
  const resized = tf.image.resizeBilinear(tensor, [48, 48]);
  
  // Convert to grayscale (if model expects grayscale input)
  const grayscale = tf.tidy(() => {
    // Calculate grayscale using standard formula
    return resized.mean(2).expandDims(2);
  });
  
  // Normalize values to [0, 1]
  const normalized = grayscale.div(255.0);
  
  // Add batch dimension
  const batched = normalized.expandDims(0);
  
  // Clean up intermediate tensors
  tensor.dispose();
  resized.dispose();
  grayscale.dispose();
  
  return batched;
};

/**
 * Detects emotion from a video element
 * @param videoElement - The video element containing the face
 * @returns Object with detected emotions and their confidence scores
 */
export const detectEmotion = async (
  videoElement: HTMLVideoElement
): Promise<{ emotion: string; confidence: number; allEmotions: Record<string, number> } | null> => {
  if (!model) {
    console.warn('Emotion detection model not loaded');
    return null;
  }

  try {
    // Create a canvas element to capture the current frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Set canvas size to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw the current video frame onto the canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Preprocess the image data for the model
    const tensor = preprocessImage(imageData);

    // Make prediction
    const predictions = await model.predict(tensor) as tf.Tensor;
    
    // Get the results
    const emotionScores = await predictions.data();
    
    // Convert to array of label-score pairs
    const emotionsWithScores = EMOTION_LABELS.map((label, index) => ({
      emotion: label,
      score: emotionScores[index]
    }));
    
    // Sort by score (highest first)
    emotionsWithScores.sort((a, b) => b.score - a.score);
    
    // Create an object with all emotions and their scores
    const allEmotions: Record<string, number> = {};
    emotionsWithScores.forEach(item => {
      allEmotions[item.emotion.toLowerCase()] = item.score;
    });
    
    // Clean up tensors
    tensor.dispose();
    predictions.dispose();
    
    // Return the top emotion with its confidence
    return {
      emotion: emotionsWithScores[0].emotion,
      confidence: emotionsWithScores[0].score,
      allEmotions
    };
  } catch (error) {
    console.error('Error during emotion detection:', error);
    return null;
  }
};
