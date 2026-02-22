import fitz  # PyMuPDF
from PIL import Image, ImageOps, ImageEnhance
import io

def load_input_as_image(file_path, dpi=200):
    """
    Unified loader: Handles both PDFs and Images (JPG/PNG).
    Optimization: dpi=200 is used for faster processing while maintaining readability.
    """
    try:
        # Check if the file is a PDF
        if file_path.lower().endswith('.pdf'):
            doc = fitz.open(file_path)
            page = doc.load_page(0)
            pix = page.get_pixmap(dpi=dpi) 
            img_data = pix.tobytes("png")
            return Image.open(io.BytesIO(img_data))
        
        # If it is already an image (jpg, jpeg, png)
        else:
            return Image.open(file_path)
            
    except Exception as e:
        print(f"Error loading file: {e}")
        return None

def preprocess_image_for_ocr(image):
    """
    Cleans up the image to make it easier for the AI to read.
    """
    gray_image = ImageOps.grayscale(image)
    enhancer = ImageEnhance.Contrast(gray_image)
    enhanced_image = enhancer.enhance(2.0)
    binary_image = enhanced_image.point(lambda x: 0 if x < 128 else 255, '1')
    return binary_image.convert("RGB")