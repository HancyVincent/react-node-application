from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import mediapipe as mp
import matplotlib.pyplot as plt
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

class PersonalStylist:
    def __init__(self):
        # Initialize MediaPipe for body detection
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=True,
            min_detection_confidence=0.5
        )

        # Define clothing database
        self.clothing_db = {
            'formal': {
                'light_skin': {
                    'hourglass': ['Navy blue suit', 'Pearl necklace', 'Beige pumps'],
                    'rectangle': ['Black blazer dress', 'Silver bracelet', 'Classic black heels'],
                    'pear': ['A-line dress in burgundy', 'Diamond studs', 'Nude heels']
                },
                'medium_skin': {
                    'hourglass': ['Royal blue dress', 'Gold necklace', 'Bronze heels'],
                    'rectangle': ['Emerald green suit', 'Gold bracelet set', 'Black pumps'],
                    'pear': ['Purple wrap dress', 'Rose gold earrings', 'Silver sandals']
                },
                'dark_skin': {
                    'hourglass': ['White suit', 'Gold statement necklace', 'Red pumps'],
                    'rectangle': ['Yellow dress', 'Diamond choker', 'Gold heels'],
                    'pear': ['Red wrap dress', 'Pearl drop earrings', 'Black strappy heels']
                }
            },
            'casual': {
                'light_skin': {
                    'hourglass': ['White t-shirt', 'Blue jeans', 'Sneakers'],
                    'rectangle': ['Striped sweater', 'Black leggings', 'Ankle boots'],
                    'pear': ['Flowy top', 'Wide-leg pants', 'Sandals']
                },
                'medium_skin': {
                    'hourglass': ['Beige cardigan', 'Dark jeans', 'White sneakers'],
                    'rectangle': ['Printed dress', 'Denim jacket', 'Slip-on shoes'],
                    'pear': ['Tunic top', 'Palazzo pants', 'Flat sandals']
                },
                'dark_skin': {
                    'hourglass': ['Yellow sundress', 'Straw hat', 'Brown sandals'],
                    'rectangle': ['White blouse', 'Colored pants', 'Espadrilles'],
                    'pear': ['Printed maxi dress', 'Statement earrings', 'Wedge sandals']
                }
            }
        }

    def upload_image(self):
        """Upload image from local system"""
        uploaded = files.upload()
        file_name = list(uploaded.keys())[0]
        return cv2.imread(file_name)

    def detect_skin_tone(self, image):
        """Detect skin tone using YCrCb color space"""
        # Convert image to YCrCb color space
        ycrcb_image = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)

        # Define skin color bounds in YCrCb
        lower_skin = np.array([0, 135, 85])
        upper_skin = np.array([255, 180, 135])

        # Create skin mask
        skin_mask = cv2.inRange(ycrcb_image, lower_skin, upper_skin)

        # Extract skin regions
        skin_region = cv2.bitwise_and(image, image, mask=skin_mask)

        # Calculate average color of skin regions
        if np.sum(skin_mask) > 0:
            average_color = np.mean(skin_region[skin_mask > 0], axis=0)
            brightness = np.mean(average_color)

            # Classify skin tone based on brightness
            if brightness > 150:
                return "light_skin"
            elif brightness < 100:
                return "dark_skin"
            else:
                return "medium_skin"

        return "medium_skin"  # Default if no skin detected

    def detect_body_shape(self, image):
        """Detect body shape using MediaPipe Pose"""
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)

        if not results.pose_landmarks:
            return "hourglass"  # Default if no pose detected

        # Extract key measurements
        landmarks = results.pose_landmarks.landmark

        # Calculate body ratios
        shoulder_width = abs(landmarks[11].x - landmarks[12].x)
        waist_width = abs(landmarks[23].x - landmarks[24].x)
        hip_width = abs(landmarks[23].x - landmarks[24].x)

        # Simple body shape classification
        if abs(shoulder_width - hip_width) < 0.1 and waist_width < min(shoulder_width, hip_width):
            return "hourglass"
        elif abs(shoulder_width - hip_width) < 0.1 and waist_width >= min(shoulder_width, hip_width):
            return "rectangle"
        else:
            return "pear"

    def get_recommendations(self, skin_tone, body_shape, occasion):
        """Get clothing and accessory recommendations"""
        try:
            recommendations = self.clothing_db[occasion][skin_tone][body_shape]
            return recommendations
        except KeyError:
            return ["No specific recommendations found. Please try different parameters."]

    def display_results(self, image, skin_tone, body_shape, recommendations):
        """Display results with matplotlib"""
        plt.figure(figsize=(12, 6))

        # Display original image
        plt.subplot(1, 2, 1)
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        plt.title('Original Image')
        plt.axis('off')

        # Display recommendations
        plt.subplot(1, 2, 2)
        plt.axis('off')
        plt.text(0.1, 0.9, f'Skin Tone: {skin_tone}', fontsize=12)
        plt.text(0.1, 0.8, f'Body Shape: {body_shape}', fontsize=12)
        plt.text(0.1, 0.7, 'Recommendations:', fontsize=12)
        for i, rec in enumerate(recommendations):
            plt.text(0.1, 0.6-i*0.1, f'- {rec}', fontsize=10)
        plt.title('Analysis Results')
        plt.show()
        
stylist = PersonalStylist()

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']

    # Read the image
    image = Image.open(file)
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Get occasion
    occasion = request.form.get('occasion', 'casual').lower()

    # Analyze the image
    skin_tone = stylist.detect_skin_tone(image)
    body_shape = stylist.detect_body_shape(image)

    # Get recommendations
    recommendations = stylist.get_recommendations(skin_tone, body_shape, occasion)

    return jsonify({
        "skin_tone": skin_tone,
        "body_shape": body_shape,
        "recommendations": recommendations
    })

if __name__ == '__main__':
    app.run(debug=True)
