from paddleocr import PaddleOCR
import numpy as np

class OCREngine:
    def __init__(self):
        print("Creating OCR Engine... (Loading Models)")
        self.ocr = PaddleOCR(use_angle_cls=False, lang='en', show_log=False)

    def extract_layout(self, image_input):
        img_array = np.array(image_input)
        result = self.ocr.ocr(img_array, cls=True)
        return result[0] if (result and result[0]) else []

    def get_raw_text(self, image_input):
        """
        Generates the Evidence Trail with tags.
        """
        layout = self.extract_layout(image_input)
        text_blob = ""
        for idx, line in enumerate(layout):
            # Format: Text Content
            text_blob += f"{line[1][0]}\n"
        return text_blob