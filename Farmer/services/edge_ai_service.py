class EdgeAIService:
    def __init__(self):
        self.models_loaded = False
        self.models = {}
    
    def load_models(self):
        """Load AI models for edge processing"""
        if not self.models_loaded:
            # Load lightweight models optimized for edge devices
            self.models['crop_health'] = self._load_lightweight_model('crop_health')
            self.models['pest_detection'] = self._load_lightweight_model('pest_detection')
            self.models_loaded = True
        return self.models_loaded
    
    def process_on_device(self, image, model_type):
        """Process images on device for edge AI"""
        if not self.models_loaded:
            self.load_models()
        
        # Process image with selected model
        result = self.models[model_type].predict(image)
        return result