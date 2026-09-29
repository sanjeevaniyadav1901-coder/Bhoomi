import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  ChevronDown
} from 'lucide-react';

// Type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
}

interface ChatBotProps {
  farmerName?: string;
  farmId?: string;
}

// Indian languages supported
const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English', flag: '🇬🇧' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'or-IN', name: 'Odia', flag: '🇮🇳' },
  { code: 'as-IN', name: 'Assamese', flag: '🇮🇳' },
];

// Multi-language responses (keeping only essential ones for brevity)
const BOT_RESPONSES: Record<string, Record<string, string>> = {
  'en-IN': {
    'hello': 'Hello! 👋 How can I help you with your farm today?',
    'hi': 'Hi there! 🌾 I\'m your Bhoomi farming assistant. How can I help?',
    'help': 'I can help you with:\n- Crop health monitoring\n- Pest detection\n- Irrigation advice\n- Weather updates\n- Fertilizer recommendations\n- Disease identification\n\nWhat would you like to know?',
    'crop': 'For better crop health, I recommend:\n1. Regular soil testing\n2. Proper irrigation scheduling\n3. Pest monitoring\n4. Balanced fertilization\n\nWhich crop are you growing?',
    'pest': 'Common pests to watch out for:\n- Aphids (sucking insects)\n- Whiteflies (yellowish insects)\n- Leaf miners (tunneling insects)\n- Thrips (tiny insects)\n\nI can help identify specific pests from images!',
    'disease': 'Common crop diseases:\n- Powdery Mildew (white powder)\n- Rust (orange-brown spots)\n- Bacterial Blight (water-soaked spots)\n- Leaf Spot (dark spots)\n\nUpload an image for AI analysis!',
    'irrigation': 'Smart irrigation tips:\n1. Water early morning or late evening\n2. Avoid over-watering\n3. Check soil moisture daily\n4. Use drip irrigation for efficiency\n\nWould you like specific advice for your crop?',
    'weather': 'I can check weather forecasts for your area. What\'s your location?',
    'fertilizer': 'Fertilizer recommendations:\n- Nitrogen (N): For leaf growth\n- Phosphorus (P): For root development\n- Potassium (K): For fruit/flower quality\n\nUpload soil data for personalized recommendations!',
    'soil': 'Healthy soil indicators:\n- pH: 6.0-7.5 (optimal range)\n- Good organic matter\n- Proper drainage\n- Balanced nutrients\n\nTest your soil regularly!',
    'default': 'I understand you\'re asking about farming. Could you be more specific? I can help with crops, pests, diseases, irrigation, weather, or fertilizers. Just let me know!'
  },
  'hi-IN': {
    'hello': 'नमस्ते! 👋 आज मैं आपके खेत के बारे में कैसे मदद कर सकता हूँ?',
    'hi': 'नमस्ते! 🌾 मैं आपका भूमि कृषि सहायक हूँ। मैं कैसे मदद कर सकता हूँ?',
    'help': 'मैं इसमें मदद कर सकता हूँ:\n- फसल स्वास्थ्य निगरानी\n- कीट पहचान\n- सिंचाई सलाह\n- मौसम अपडेट\n- उर्वरक सिफारिशें\n- रोग पहचान\n\nआप क्या जानना चाहेंगे?',
    'crop': 'बेहतर फसल स्वास्थ्य के लिए:\n1. नियमित मिट्टी परीक्षण\n2. उचित सिंचाई योजना\n3. कीट निगरानी\n4. संतुलित उर्वरक\n\nआप कौन सी फसल उगा रहे हैं?',
    'pest': 'सामान्य कीट:\n- एफिड्स (चूसने वाले कीड़े)\n- व्हाइटफ्लाई (पीले रंग के कीड़े)\n- लीफ माइनर्स (सुरंग बनाने वाले कीड़े)\n- थ्रिप्स (छोटे कीड़े)\n\nमैं छवियों से विशिष्ट कीट पहचानने में मदद कर सकता हूँ!',
    'disease': 'सामान्य फसल रोग:\n- पाउडरी मिल्ड्यू (सफेद पाउडर)\n- रस्ट (नारंगी-भूरे धब्बे)\n- बैक्टीरियल ब्लाइट (पानी जैसे धब्बे)\n- लीफ स्पॉट (गहरे धब्बे)\n\nएआई विश्लेषण के लिए छवि अपलोड करें!',
    'irrigation': 'स्मार्ट सिंचाई सुझाव:\n1. सुबह या शाम को पानी दें\n2. अधिक पानी देने से बचें\n3. रोजाना मिट्टी की नमी जांचें\n4. ड्रिप सिंचाई का उपयोग करें\n\nक्या आप अपनी फसल के लिए विशिष्ट सलाह चाहेंगे?',
    'weather': 'मैं आपके क्षेत्र के मौसम पूर्वानुमान देख सकता हूँ। आपका स्थान क्या है?',
    'fertilizer': 'उर्वरक सिफारिशें:\n- नाइट्रोजन (N): पत्ती विकास के लिए\n- फॉस्फोरस (P): जड़ विकास के लिए\n- पोटैशियम (K): फल/फूल की गुणवत्ता के लिए\n\nव्यक्तिगत सिफारिशों के लिए मिट्टी डेटा अपलोड करें!',
    'soil': 'स्वस्थ मिट्टी के संकेतक:\n- pH: 6.0-7.5 (सर्वोत्तम सीमा)\n- अच्छा कार्बनिक पदार्थ\n- उचित जल निकासी\n- संतुलित पोषक तत्व\n\nनियमित रूप से अपनी मिट्टी की जांच करें!',
    'default': 'मैं समझ गया हूँ कि आप खेती के बारे में पूछ रहे हैं। क्या आप थोड़ा और विशिष्ट हो सकते हैं? मैं फसलों, कीटों, रोगों, सिंचाई, मौसम, या उर्वरकों के बारे में मदद कर सकता हूँ।'
  },
  'mr-IN': {
    'hello': 'नमस्कार! 👋 आज मी तुमच्या शेताबद्दल कशी मदत करू शकतो?',
    'hi': 'नमस्कार! 🌾 मी तुमचा भूमी शेती सहाय्यक आहे. मी कशी मदत करू शकतो?',
    'help': 'मी यामध्ये मदत करू शकतो:\n- पीक आरोग्य निरीक्षण\n- कीटक ओळख\n- सिंचन सल्ला\n- हवामान अद्ययावत\n- खत शिफारसी\n- रोग ओळख\n\nतुम्हाला काय जाणून घ्यायचे आहे?',
    'crop': 'चांगल्या पीक आरोग्यासाठी:\n1. नियमित माती चाचणी\n2. योग्य सिंचन नियोजन\n3. कीटक निरीक्षण\n4. संतुलित खत\n\nतुम्ही कोणते पीक घेत आहात?',
    'pest': 'सामान्य कीटक:\n- ऍफिड्स (शोषण करणारे किडे)\n- व्हाईटफ्लाय (पिवळे किडे)\n- लीफ मायनर्स (बोगदे बनवणारे किडे)\n- थ्रिप्स (लहान किडे)\n\nमी प्रतिमांमधून विशिष्ट कीटक ओळखण्यास मदत करू शकतो!',
    'disease': 'सामान्य पीक रोग:\n- पावडरी मिल्ड्यू (पांढरा पावडर)\n- गंज (नारिंगी-तपकिरी डाग)\n- बॅक्टेरियल ब्लाइट (पाण्यासारखे डाग)\n- पानावरील डाग (गडद डाग)\n\nएआय विश्लेषणासाठी प्रतिमा अपलोड करा!',
    'irrigation': 'स्मार्ट सिंचन सूचना:\n1. सकाळी किंवा संध्याकाळी पाणी द्या\n2. जास्त पाणी देऊ नका\n3. रोज मातीतील ओलावा तपासा\n4. ठिबक सिंचन वापरा\n\nतुम्हाला तुमच्या पिकासाठी विशिष्ट सल्ला हवा आहे का?',
    'weather': 'मी तुमच्या क्षेत्राचा हवामान अंदाज पाहू शकतो. तुमचे स्थान काय आहे?',
    'fertilizer': 'खत शिफारसी:\n- नायट्रोजन (N): पानांच्या वाढीसाठी\n- फॉस्फरस (P): मुळांच्या वाढीसाठी\n- पोटॅशियम (K): फळ/फुलांच्या गुणवत्तेसाठी\n\nवैयक्तिक शिफारसींसाठी माती डेटा अपलोड करा!',
    'soil': 'निरोगी मातीचे संकेतक:\n- pH: 6.0-7.5 (सर्वोत्तम श्रेणी)\n- चांगला सेंद्रिय पदार्थ\n- योग्य निचरा\n- संतुलित पोषक तत्वे\n\nनियमितपणे माती तपासा!',
    'default': 'मला समजले की तुम्ही शेतीबद्दल विचारत आहात. तुम्ही थोडे अधिक विशिष्ट होऊ शकता का? मी पिके, कीटक, रोग, सिंचन, हवामान किंवा खतांबद्दल मदत करू शकतो.'
  },
  'ml-IN': {
    'hello': 'ഹലോ! 👋 ഇന്ന് നിങ്ങളുടെ കൃഷിയിടത്തിന് എങ്ങനെ സഹായിക്കാനാകും?',
    'hi': 'ഹലോ! 🌾 ഞാൻ നിങ്ങളുടെ ഭൂമി കാർഷിക സഹായിയാണ്. എങ്ങനെ സഹായിക്കാനാകും?',
    'help': 'എനിക്ക് ഇതിൽ സഹായിക്കാനാകും:\n- വിള ആരോഗ്യ നിരീക്ഷണം\n- കീട കണ്ടെത്തൽ\n- ജലസേചന ഉപദേശം\n- കാലാവസ്ഥാ അപ്ഡേറ്റുകൾ\n- വള ശുപാർശകൾ\n- രോഗ തിരിച്ചറിയൽ\n\nനിങ്ങൾക്ക് എന്ത് അറിയണം?',
    'crop': 'മെച്ചപ്പെട്ട വിള ആരോഗ്യത്തിന്:\n1. പതിവ് മണ്ണ് പരിശോധന\n2. ശരിയായ ജലസേചന ആസൂത്രണം\n3. കീട നിരീക്ഷണം\n4. സമതുലിതമായ വളപ്രയോഗം\n\nനിങ്ങൾ ഏത് വിളയാണ് വളർത്തുന്നത്?',
    'pest': 'ശ്രദ്ധിക്കേണ്ട സാധാരണ കീടങ്ങൾ:\n- അഫിഡുകൾ (ഞെക്കി പിഴിഞ്ഞ് ഭക്ഷിക്കുന്ന പ്രാണികൾ)\n- വൈറ്റ്ഫ്ലൈ (മഞ്ഞ നിറത്തിലുള്ള പ്രാണികൾ)\n- ലീഫ് മൈനേഴ്സ് (തുരങ്കമുണ്ടാക്കുന്ന പ്രാണികൾ)\n- ത്രിപ്സ് (ചെറിയ പ്രാണികൾ)\n\nചിത്രങ്ങളിൽ നിന്ന് പ്രത്യേക കീടങ്ങളെ തിരിച്ചറിയാൻ എനിക്ക് സഹായിക്കാനാകും!',
    'disease': 'സാധാരണ വിള രോഗങ്ങൾ:\n- പൗഡറി മിൽഡ്യൂ (വെളുത്ത പൊടി)\n- റസ്റ്റ് (ഓറഞ്ച്-തവിട്ട് പാടുകൾ)\n- ബാക്ടീരിയൽ ബ്ലൈറ്റ് (വെള്ളം പോലെയുള്ള പാടുകൾ)\n- ലീഫ് സ്പോട്ട് (ഇരുണ്ട പാടുകൾ)\n\nAI വിശകലനത്തിനായി ചിത്രം അപ്ലോഡ് ചെയ്യുക!',
    'irrigation': 'സ്മാർട്ട് ജലസേചന ടിപ്പുകൾ:\n1. രാവിലെയോ വൈകുന്നേരമോ വെള്ളം നൽകുക\n2. അമിതമായി നനക്കുന്നത് ഒഴിവാക്കുക\n3. ദിവസവും മണ്ണിന്റെ ഈർപ്പം പരിശോധിക്കുക\n4. കാര്യക്ഷമതയ്ക്കായി ഡ്രിപ്പ് ഇറിഗേഷൻ ഉപയോഗിക്കുക\n\nനിങ്ങളുടെ വിളയ്ക്ക് പ്രത്യേക ഉപദേശം വേണോ?',
    'weather': 'നിങ്ങളുടെ പ്രദേശത്തെ കാലാവസ്ഥാ പ്രവചനം പരിശോധിക്കാനാകും. നിങ്ങളുടെ സ്ഥലം എവിടെയാണ്?',
    'fertilizer': 'വള ശുപാർശകൾ:\n- നൈട്രജൻ (N): ഇല വളർച്ചയ്ക്ക്\n- ഫോസ്ഫറസ് (P): വേര് വികസനത്തിന്\n- പൊട്ടാസ്യം (K): പഴം/പൂക്കളുടെ ഗുണമേന്മയ്ക്ക്\n\nവ്യക്തിഗത ശുപാർശകൾക്കായി മണ്ണ് ഡാറ്റ അപ്ലോഡ് ചെയ്യുക!',
    'soil': 'ആരോഗ്യകരമായ മണ്ണിന്റെ സൂചകങ്ങൾ:\n- pH: 6.0-7.5 (അനുയോജ്യമായ പരിധി)\n- നല്ല ജൈവ പദാർത്ഥം\n- ശരിയായ ഡ്രെയിനേജ്\n- സമതുലിതമായ പോഷകങ്ങൾ\n\nനിങ്ങളുടെ മണ്ണ് പതിവായി പരിശോധിക്കുക!',
    'default': 'നിങ്ങൾ കൃഷിയെക്കുറിച്ച് ചോദിക്കുന്നുവെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു. നിങ്ങൾക്ക് കുറച്ചുകൂടി വ്യക്തമാക്കാമോ? വിളകൾ, കീടങ്ങൾ, രോഗങ്ങൾ, ജലസേചനം, കാലാവസ്ഥ, അല്ലെങ്കിൽ വളങ്ങൾ എന്നിവയിൽ എനിക്ക് സഹായിക്കാനാകും.'
  },
  'ta-IN': {
    'hello': 'வணக்கம்! 👋 இன்று உங்கள் பண்ணைக்கு நான் எவ்வாறு உதவ முடியும்?',
    'hi': 'வணக்கம்! 🌾 நான் உங்கள் பூமி விவசாய உதவியாளர். நான் எவ்வாறு உதவ முடியும்?',
    'help': 'நான் இதில் உதவ முடியும்:\n- பயிர் ஆரோக்கிய கண்காணிப்பு\n- பூச்சி கண்டறிதல்\n- பாசன ஆலோசனை\n- வானிலை புதுப்பிப்புகள்\n- உர பரிந்துரைகள்\n- நோய் அடையாளம்\n\nநீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?',
    'crop': 'சிறந்த பயிர் ஆரோக்கியத்திற்கு:\n1. வழக்கமான மண் பரிசோதனை\n2. சரியான பாசன திட்டமிடல்\n3. பூச்சி கண்காணிப்பு\n4. சீரான உரமிடுதல்\n\nநீங்கள் எந்த பயிர் வளர்க்கிறீர்கள்?',
    'pest': 'கவனிக்க வேண்டிய பொதுவான பூச்சிகள்:\n- அசுவினி (உறிஞ்சும் பூச்சிகள்)\n- வெள்ளை ஈ (மஞ்சள் பூச்சிகள்)\n- இலை சுரங்கப்பூச்சிகள் (துளையிடும் பூச்சிகள்)\n- த்ரிப்ஸ் (சிறிய பூச்சிகள்)\n\nபடங்களிலிருந்து குறிப்பிட்ட பூச்சிகளை அடையாளம் காண நான் உதவ முடியும்!',
    'disease': 'பொதுவான பயிர் நோய்கள்:\n- பவுடரி மில்டியூ (வெள்ளை பொடி)\n- ரஸ்ட் (ஆரஞ்சு-பழுப்பு புள்ளிகள்)\n- பாக்டீரியல் பிளைட் (தண்ணீர் போன்ற புள்ளிகள்)\n- இலை புள்ளி (இருண்ட புள்ளிகள்)\n\nAI பகுப்பாய்வுக்கு படத்தை பதிவேற்றவும்!',
    'irrigation': 'ஸ்மார்ட் பாசன குறிப்புகள்:\n1. காலை அல்லது மாலையில் தண்ணீர் பாய்ச்சவும்\n2. அதிக நீர் பாய்ச்சுவதை தவிர்க்கவும்\n3. தினமும் மண்ணின் ஈரப்பதத்தை சரிபார்க்கவும்\n4. சொட்டு நீர் பாசனத்தை பயன்படுத்தவும்\n\nஉங்கள் பயிருக்கு குறிப்பிட்ட ஆலோசனை வேண்டுமா?',
    'weather': 'உங்கள் பகுதியின் வானிலை முன்னறிவிப்பை நான் பார்க்க முடியும். உங்கள் இருப்பிடம் என்ன?',
    'fertilizer': 'உர பரிந்துரைகள்:\n- நைட்ரஜன் (N): இலை வளர்ச்சிக்கு\n- பாஸ்பரஸ் (P): வேர் வளர்ச்சிக்கு\n- பொட்டாசியம் (K): பழம்/பூ தரத்திற்கு\n\nதனிப்பயனாக்கப்பட்ட பரிந்துரைகளுக்கு மண் தரவை பதிவேற்றவும்!',
    'soil': 'ஆரோக்கியமான மண்ணின் குறிகாட்டிகள்:\n- pH: 6.0-7.5 (உகந்த வரம்பு)\n- நல்ல கரிமப் பொருள்\n- சரியான வடிகால்\n- சீரான ஊட்டச்சத்துக்கள்\n\nஉங்கள் மண்ணை தவறாமல் பரிசோதிக்கவும்!',
    'default': 'நீங்கள் விவசாயத்தைப் பற்றி கேட்கிறீர்கள் என்பதை நான் புரிந்துகொண்டேன். நீங்கள் இன்னும் குறிப்பிட்டதாக இருக்க முடியுமா? பயிர்கள், பூச்சிகள், நோய்கள், பாசனம், வானிலை அல்லது உரங்கள் பற்றி நான் உதவ முடியும்.'
  }
};

// Map language codes to display names
const LANGUAGE_NAMES: Record<string, string> = {
  'en-IN': 'English',
  'hi-IN': 'हिंदी',
  'mr-IN': 'मराठी',
  'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'gu-IN': 'ગુજરાતી',
  'bn-IN': 'বাংলা',
  'pa-IN': 'ਪੰਜਾਬੀ',
  'or-IN': 'ଓଡ଼ିଆ',
  'as-IN': 'অসমীয়া'
};

export function ChatBot({ farmerName = 'Farmer', farmId }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${farmerName}! 👋 I'm your Bhoomi farming assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
      language: 'en-IN'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check browser support
  useEffect(() => {
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    
    if (!hasSpeechRecognition || !hasSpeechSynthesis) {
      setIsSpeechSupported(false);
      console.warn('Speech features not supported in this browser');
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition with selected language
  useEffect(() => {
    if (!isSpeechSupported) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInputText(finalTranscript);
            handleSendMessage(finalTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setIsSpeechSupported(false);
    }
  }, [selectedLanguage, isSpeechSupported]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const getBotResponse = (userMessage: string, lang: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    const responses = BOT_RESPONSES[lang] || BOT_RESPONSES['en-IN'];
    
    // Check for keywords
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || 
        lowerMsg.includes('नमस्ते') || lowerMsg.includes('नमस्कार') || lowerMsg.includes('வணக்கம்') ||
        lowerMsg.includes('ഹലോ')) {
      return responses['hello'];
    }
    if (lowerMsg.includes('help') || lowerMsg.includes('मदद') || lowerMsg.includes('உதவி') ||
        lowerMsg.includes('സഹായം')) {
      return responses['help'];
    }
    if (lowerMsg.includes('crop') || lowerMsg.includes('plant') || lowerMsg.includes('पीक') || 
        lowerMsg.includes('फसल') || lowerMsg.includes('பயிர்') || lowerMsg.includes('വിള')) {
      return responses['crop'];
    }
    if (lowerMsg.includes('pest') || lowerMsg.includes('bug') || lowerMsg.includes('insect') ||
        lowerMsg.includes('कीट') || lowerMsg.includes('कीटक') || lowerMsg.includes('பூச்சி') ||
        lowerMsg.includes('കീട')) {
      return responses['pest'];
    }
    if (lowerMsg.includes('disease') || lowerMsg.includes('sick') || lowerMsg.includes('infection') ||
        lowerMsg.includes('रोग') || lowerMsg.includes('आजार') || lowerMsg.includes('நோய்') ||
        lowerMsg.includes('രോഗം')) {
      return responses['disease'];
    }
    if (lowerMsg.includes('irrigation') || lowerMsg.includes('water') || lowerMsg.includes('drip') ||
        lowerMsg.includes('सिंचन') || lowerMsg.includes('पाणी') || lowerMsg.includes('பாசனம்') ||
        lowerMsg.includes('ജലസേചനം')) {
      return responses['irrigation'];
    }
    if (lowerMsg.includes('weather') || lowerMsg.includes('rain') || lowerMsg.includes('temperature') ||
        lowerMsg.includes('मौसम') || lowerMsg.includes('हवामान') || lowerMsg.includes('வானிலை') ||
        lowerMsg.includes('കാലാവസ്ഥ')) {
      return responses['weather'];
    }
    if (lowerMsg.includes('fertilizer') || lowerMsg.includes('nutrient') || lowerMsg.includes('manure') ||
        lowerMsg.includes('उर्वरक') || lowerMsg.includes('खत') || lowerMsg.includes('உரம்') ||
        lowerMsg.includes('വളം')) {
      return responses['fertilizer'];
    }
    if (lowerMsg.includes('soil') || lowerMsg.includes('ph') || lowerMsg.includes('organic') ||
        lowerMsg.includes('मिट्टी') || lowerMsg.includes('माती') || lowerMsg.includes('மண்') ||
        lowerMsg.includes('മണ്ണ്')) {
      return responses['soil'];
    }
    
    return responses['default'];
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Get bot response in selected language
    const botResponse = getBotResponse(text, selectedLanguage);
    
    // Add bot message
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
      language: selectedLanguage
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Auto-speak bot response
    if (isSpeaking && isSpeechSupported) {
      speakText(botResponse, selectedLanguage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert('Voice input is not supported in this browser. Please use typing instead.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLanguage;
          recognitionRef.current.start();
          setIsListening(true);
        } else {
          alert('Speech recognition is not available. Please type your question.');
        }
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string, lang: string = 'en-IN') => {
    if (!isSpeechSupported) return;
    
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Try to find voice for selected language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes(lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeaking = () => {
    if (!isSpeechSupported) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    setIsSpeaking(!isSpeaking);
    if (!isSpeaking && messages.length > 0) {
      const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
      if (lastBotMessage) {
        speakText(lastBotMessage.text, lastBotMessage.language || 'en-IN');
      }
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    
    // Add a system message about language change
    const langName = LANGUAGE_NAMES[langCode] || langCode;
    const welcomeMsg = `Language changed to ${langName}. You can now ask questions in ${langName}.`;
    
    const botMessage: Message = {
      id: Date.now().toString(),
      text: welcomeMsg,
      sender: 'bot',
      timestamp: new Date(),
      language: langCode
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Quick suggestions for farmers (multi-language)
  const getQuickSuggestions = (lang: string) => {
    const suggestions: Record<string, string[]> = {
      'en-IN': [
        'What crops should I grow?',
        'Help with pests',
        'Disease detection',
        'Irrigation advice',
        'Weather update',
        'Fertilizer recommendations'
      ],
      'hi-IN': [
        'मुझे कौन सी फसल उगानी चाहिए?',
        'कीटों के लिए मदद',
        'रोग पहचान',
        'सिंचाई सलाह',
        'मौसम अपडेट',
        'उर्वरक सिफारिशें'
      ],
      'mr-IN': [
        'मी कोणते पीक घ्यावे?',
        'कीटकांसाठी मदत',
        'रोग ओळख',
        'सिंचन सल्ला',
        'हवामान अद्ययावत',
        'खत शिफारसी'
      ],
      'ml-IN': [
        'ഏത് വിളയാണ് ഞാൻ വളർത്തേണ്ടത്?',
        'കീടങ്ങൾക്ക് സഹായം',
        'രോഗ കണ്ടെത്തൽ',
        'ജലസേചന ഉപദേശം',
        'കാലാവസ്ഥാ അപ്ഡേറ്റ്',
        'വള ശുപാർശകൾ'
      ],
      'ta-IN': [
        'நான் எந்த பயிர் வளர்க்க வேண்டும்?',
        'பூச்சிகளுக்கு உதவி',
        'நோய் கண்டறிதல்',
        'பாசன ஆலோசனை',
        'வானிலை புதுப்பிப்பு',
        'உர பரிந்துரைகள்'
      ]
    };
    return suggestions[lang] || suggestions['en-IN'];
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
      isMinimized ? 'w-72 h-14' : 'w-[420px] h-[680px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <span className="font-semibold text-white">Bhoomi Assistant</span>
          <span className="text-xs text-green-200 ml-1">● Online</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Language Selector - FIXED VISIBILITY */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-sm"
              title="Change language"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">
                {LANGUAGE_NAMES[selectedLanguage] || 'English'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLanguageMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl py-2 min-w-[220px] max-h-[350px] overflow-y-auto z-[999] border border-gray-200">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-green-50 transition-colors flex items-center gap-3 ${
                      selectedLanguage === lang.code ? 'bg-green-100 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <span className="ml-auto text-green-600 text-sm font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={toggleSpeaking}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            disabled={!isSpeechSupported}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Language indicator */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span className="font-medium">Current Language: <span className="text-gray-700">{LANGUAGE_NAMES[selectedLanguage] || selectedLanguage}</span></span>
            </div>
            {!isSpeechSupported && (
              <span className="text-red-500">⚠️ Voice not supported</span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[440px] bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-green-600' 
                    : 'bg-blue-600'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</div>
                  <div className={`text-xs mt-1 flex items-center gap-2 ${
                    message.sender === 'user' ? 'text-green-200' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.language && message.language !== 'en-IN' && (
                      <span className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] text-gray-600 font-medium">
                        {LANGUAGE_NAMES[message.language] || message.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {getQuickSuggestions(selectedLanguage).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:bg-green-50 hover:border-green-300 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
                disabled={!isSpeechSupported}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? '🎤 Listening...' : `Ask in ${LANGUAGE_NAMES[selectedLanguage] || 'English'}`}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                disabled={isListening}
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isListening}
                className="p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {/* Language support indicator */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-[10px] text-gray-400">
                Supported: {SUPPORTED_LANGUAGES.map(l => l.name).join(' • ')}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                {selectedLanguage === 'mr-IN' ? '🇮🇳 मराठी' : 
                 selectedLanguage === 'ml-IN' ? '🇮🇳 മലയാളം' :
                 selectedLanguage === 'ta-IN' ? '🇮🇳 தமிழ்' :
                 selectedLanguage === 'hi-IN' ? '🇮🇳 हिंदी' :
                 selectedLanguage === 'en-IN' ? '🇬🇧 English' : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}