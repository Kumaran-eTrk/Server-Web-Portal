from flask import Flask, request, jsonify
import os
import base64 
from moviepy.editor import ImageSequenceClip  # Updated import statement
from PIL import Image
import numpy as np
app = Flask(__name__)


@app.route('/generate_video', methods=['POST'])
def generate_video():
    try:
        
       
        data = request.json
        image_paths = data.get('image_folder', []) # Assuming 'image_paths' is a list of image paths
        output_video_path = data.get('output_video_path')

   
      

        fps = 3
        video_codec = 'libx264'
        video_bitrate = '500k'

        resized_images = []

        for img_path in image_paths:
            try:
                if os.path.isfile(img_path):
                    with Image.open(img_path) as original_image:
                        resized_image = original_image.resize((640, 480))
                        resized_images.append(np.array(resized_image))
            except Exception as e:
                print(f"Skipping invalid image: {img_path} - Error: {e}")

        if resized_images:
            clip = ImageSequenceClip(resized_images, fps=fps)
            clip.write_videofile(output_video_path, fps=fps, codec=video_codec, bitrate=video_bitrate)

            with open(output_video_path, "rb") as video_file:
                video_content = video_file.read()

            base64_video = base64.b64encode(video_content).decode('utf-8')

            print("Image paths:", image_paths)
            print("Output video path:", output_video_path)
        else:
            print("No valid images found to create the video.")


        # Send the base64 encoded video content in the response
        return jsonify({'message': 'Video generated successfully', 'video_base64': base64_video})

    except Exception as e:
        print({'error':str(e)})
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
  app.run(host='0.0.0.0',port=9011,debug=True)

