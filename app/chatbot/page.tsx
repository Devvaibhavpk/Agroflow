"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Tractor,
    Loader2,
    Send,
    Crop,
    Settings,
    Globe,
    LogOut
} from 'lucide-react';
import axios from 'axios';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
interface BotMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
}

// Language options with UI translations
const languageOptions = [
    {
        value: "english",
        label: "English",
        ui: {
            welcomeMessage: "Hello! I'm your Agricultural AI Assistant. How can I help you with farming, crops, or agricultural challenges today?",
            placeholder: "Ask about farming, crops, weather...",
            thinking: "Thinking...",
            responseLanguage: "Response Language",
            options: "Options",
            clearConversation: "Clear Conversation",
            signIn: "Sign In",
            signInMessage: "Please sign in to access the Agricultural Assistant",
            errorTitle: "Error",
            errorMessage: "Failed to send message. Please check your connection and try again.",
            agriculturalAssistant: "Agricultural Assistant"
        }
    },
    {
        value: "hindi",
        label: "हिन्दी (Hindi)",
        ui: {
            welcomeMessage: "नमस्ते! मैं आपका कृषि AI सहायक हूँ। आज मैं आपकी खेती, फसलों, या कृषि चुनौतियों के बारे में कैसे मदद कर सकता हूँ?",
            placeholder: "खेती, फसलों, मौसम के बारे में पूछें...",
            thinking: "सोच रहा हूँ...",
            responseLanguage: "उत्तर भाषा",
            options: "विकल्प",
            clearConversation: "बातचीत साफ़ करें",
            signIn: "साइन इन करें",
            signInMessage: "कृषि सहायक तक पहुंचने के लिए कृपया साइन इन करें",
            errorTitle: "त्रुटि",
            errorMessage: "संदेश भेजने में विफल। कृपया अपने कनेक्शन की जांच करें और पुनः प्रयास करें।",
            agriculturalAssistant: "कृषि सहायक"
        }
    },
    {
        value: "tamil",
        label: "தமிழ் (Tamil)",
        ui: {
            welcomeMessage: "வணக்கம்! நான் உங்களின் விவசாய AI உதவியாளர். இன்று விவசாயம், பயிர்கள் அல்லது விவசாய சவால்கள் குறித்து நான் எவ்வாறு உதவ முடியும்?",
            placeholder: "விவசாயம், பயிர்கள், வானிலை பற்றி கேளுங்கள்...",
            thinking: "சிந்திக்கிறேன்...",
            responseLanguage: "பதில் மொழி",
            options: "விருப்பங்கள்",
            clearConversation: "உரையாடலை அழிக்கவும்",
            signIn: "உள்நுழைக",
            signInMessage: "விவசாய உதவியாளரை அணுக தயவுசெய்து உள்நுழைக",
            errorTitle: "பிழை",
            errorMessage: "செய்தி அனுப்ப முடியவில்லை. உங்கள் இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
            agriculturalAssistant: "விவசாய உதவியாளர்"
        }
    },
    {
        value: "telugu",
        label: "తెలుగు (Telugu)",
        ui: {
            welcomeMessage: "నమస్కారం! నేను మీ వ్యవసాయ AI సహాయకుడిని. నేడు వ్యవసాయం, పంటలు లేదా వ్యవసాయ సవాళ్ల గురించి నేను మీకు ఎలా సహాయపడగలను?",
            placeholder: "వ్యవసాయం, పంటలు, వాతావరణం గురించి అడగండి...",
            thinking: "ఆలోచిస్తున్నాను...",
            responseLanguage: "సమాధానం భాష",
            options: "ఎంపికలు",
            clearConversation: "సంభాషణను క్లియర్ చేయండి",
            signIn: "సైన్ ఇన్ చేయండి",
            signInMessage: "వ్యవసాయ సహాయకుడిని యాక్సెస్ చేయడానికి దయచేసి సైన్ ఇన్ చేయండి",
            errorTitle: "లోపం",
            errorMessage: "సందేశాన్ని పంపడంలో విఫలమైంది. మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
            agriculturalAssistant: "వ్యవసాయ సహాయకుడు"
        }
    },
    {
        value: "malayalam",
        label: "മലയാളം (Malayalam)",
        ui: {
            welcomeMessage: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കാർഷിക AI അസിസ്റ്റന്റ് ആണ്. ഇന്ന് കൃഷി, വിളകൾ, അല്ലെങ്കിൽ കാർഷിക വെല്ലുവിളികളെക്കുറിച്ച് ഞാൻ എങ്ങനെ സഹായിക്കാം?",
            placeholder: "കൃഷി, വിളകൾ, കാലാവസ്ഥ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
            thinking: "ചിന്തിക്കുന്നു...",
            responseLanguage: "മറുപടി ഭാഷ",
            options: "ഓപ്ഷനുകൾ",
            clearConversation: "സംഭാഷണം മായ്ക്കുക",
            signIn: "സൈൻ ഇൻ ചെയ്യുക",
            signInMessage: "കാർഷിക അസിസ്റ്റന്റ് ആക്സസ് ചെയ്യുന്നതിന് ദയവായി സൈൻ ഇൻ ചെയ്യുക",
            errorTitle: "പിശക്",
            errorMessage: "സന്ദേശം അയയ്ക്കുന്നതിൽ പരാജയപ്പെട്ടു. നിങ്ങളുടെ കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
            agriculturalAssistant: "കാർഷിക സഹായി"
        }
    },
    {
        value: "punjabi",
        label: "ਪੰਜਾਬੀ (Punjabi)",
        ui: {
            welcomeMessage: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ AI ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਨੂੰ ਖੇਤੀਬਾੜੀ, ਫਸਲਾਂ, ਜਾਂ ਖੇਤੀਬਾੜੀ ਚੁਣੌਤੀਆਂ ਬਾਰੇ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
            placeholder: "ਖੇਤੀਬਾੜੀ, ਫਸਲਾਂ, ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ...",
            thinking: "ਸੋਚ ਰਿਹਾ ਹਾਂ...",
            responseLanguage: "ਜਵਾਬ ਭਾਸ਼ਾ",
            options: "ਵਿਕਲਪ",
            clearConversation: "ਗੱਲਬਾਤ ਸਾਫ਼ ਕਰੋ",
            signIn: "ਸਾਈਨ ਇਨ ਕਰੋ",
            signInMessage: "ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ ਤੱਕ ਪਹੁੰਚ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਸਾਈਨ ਇਨ ਕਰੋ",
            errorTitle: "ਗਲਤੀ",
            errorMessage: "ਸੁਨੇਹਾ ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਕਨੈਕਸ਼ਨ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            agriculturalAssistant: "ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ"
        }
    },
    {
        value: "marathi",
        label: "मराठी (Marathi)",
        ui: {
            welcomeMessage: "नमस्कार! मी तुमचा कृषी AI सहाय्यक आहे. आज मी तुम्हाला शेती, पिके किंवा कृषी आव्हानांबद्दल कशी मदत करू शकतो?",
            placeholder: "शेती, पिके, हवामानाबद्दल विचारा...",
            thinking: "विचार करत आहे...",
            responseLanguage: "प्रतिसाद भाषा",
            options: "पर्याय",
            clearConversation: "संभाषण साफ करा",
            signIn: "साइन इन करा",
            signInMessage: "कृषी सहाय्यकापर्यंत पोहोचण्यासाठी कृपया साइन इन करा",
            errorTitle: "त्रुटी",
            errorMessage: "संदेश पाठविण्यात अयशस्वी. कृपया आपले कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
            agriculturalAssistant: "कृषी सहाय्यक"
        }
    },
    {
        value: "kannada",
        label: "ಕನ್ನಡ (Kannada)",
        ui: {
            welcomeMessage: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ AI ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಕೃಷಿ, ಬೆಳೆಗಳು ಅಥವಾ ಕೃಷಿ ಸವಾಲುಗಳ ಬಗ್ಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
            placeholder: "ಕೃಷಿ, ಬೆಳೆಗಳು, ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ...",
            thinking: "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...",
            responseLanguage: "ಪ್ರತಿಕ್ರಿಯೆ ಭಾಷೆ",
            options: "ಆಯ್ಕೆಗಳು",
            clearConversation: "ಸಂಭಾಷಣೆಯನ್ನು ತೆರವುಗೊಳಿಸಿ",
            signIn: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
            signInMessage: "ಕೃಷಿ ಸಹಾಯಕವನ್ನು ಪ್ರವೇಶಿಸಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ",
            errorTitle: "ದೋಷ",
            errorMessage: "ಸಂದೇಶವನ್ನು ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            agriculturalAssistant: "ಕೃಷಿ ಸಹಾಯಕ"
        }
    }
];

// Markdown Component
const MarkdownComponent = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
                h1: ({ ...props }) => <h1 className="text-2xl font-bold my-2" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xl font-bold my-2" {...props} />,
                h3: ({ ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
                p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc pl-6 mb-2" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                li: ({ ...props }) => <li className="mb-1" {...props} />,
                a: ({ ...props }) => (
                    <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default function AgriBotPage() {
    const { user, signOut, isLoading } = useAuth();
    const router = useRouter();

    // State Management
    const [selectedLanguage, setSelectedLanguage] = useState("english");
    const [messages, setMessages] = useState<BotMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get current language UI strings
    const getCurrentLanguageUI = useCallback(() => {
        return languageOptions.find(lang => lang.value === selectedLanguage)?.ui || languageOptions[0].ui;
    }, [selectedLanguage]);

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (user?.user_metadata?.full_name) {
            const names = user.user_metadata.full_name.split(' ');
            return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    // Initialize chat with welcome message in selected language
    useEffect(() => {
        const langUI = getCurrentLanguageUI();
        setMessages([
            {
                id: `initial-${Date.now()}`,
                text: langUI.welcomeMessage,
                sender: 'bot',
                timestamp: Date.now()
            }
        ]);
    }, [getCurrentLanguageUI]);

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Update scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Send message handler
    const handleSendMessage = async () => {
        if (!user || inputMessage.trim() === '') return;

        const langUI = getCurrentLanguageUI();
        setError(null);
        setIsSending(true);

        try {
            const userMessageId = `user-${Date.now()}`;
            const userMessage: BotMessage = {
                id: userMessageId,
                text: inputMessage,
                sender: 'user',
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, userMessage]);

            const response = await axios.post('/api/ask', {
                question: inputMessage,
                language: selectedLanguage
            });

            const botMessageId = `bot-${Date.now()}`;
            const botMessage: BotMessage = {
                id: botMessageId,
                text: response.data.answer,
                sender: 'bot',
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMessage]);
            setInputMessage('');
            inputRef.current?.focus();
        } catch (err) {
            console.error('Message send error:', err);
            setError(langUI.errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    // Clear conversation
    const clearConversation = () => {
        const langUI = getCurrentLanguageUI();
        setMessages([
            {
                id: `initial-${Date.now()}`,
                text: langUI.welcomeMessage,
                sender: 'bot',
                timestamp: Date.now()
            }
        ]);
    };

    // Handle language change
    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
    };

    // Handle sign out
    const handleSignOut = async () => {
        await signOut();
    };

    const langUI = getCurrentLanguageUI();

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    // Not signed in
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Card className="w-96 shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Tractor className="text-green-600" /> AgriChat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <p className="text-center text-gray-600">{langUI.signInMessage}</p>
                        <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                            onClick={() => router.push('/signin')}
                        >
                            {langUI.signIn}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center text-green-800">
                        <Tractor className="mr-2 text-green-600" /> AgriChat
                    </h2>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={user?.user_metadata?.avatar_url}
                            alt={user?.user_metadata?.full_name || 'User Profile'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{user?.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:bg-red-50" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 text-red-500" />
                    </Button>
                </div>

                {/* Language Selection */}
                <div className="mt-2 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-green-600" />
                        {langUI.responseLanguage}
                    </label>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languageOptions.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <Card className="flex-1 flex flex-col m-4 shadow-lg overflow-hidden border-0 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-2xl flex flex-row items-center justify-between py-4">
                        <div className="flex items-center space-x-3">
                            <Crop className="w-8 h-8" />
                            <CardTitle className="text-xl">
                                {langUI.agriculturalAssistant}
                            </CardTitle>
                            <div className="flex items-center text-sm bg-green-700/50 px-3 py-1 rounded-full">
                                <Globe className="h-3 w-3 mr-1" />
                                {languageOptions.find(lang => lang.value === selectedLanguage)?.label || "English"}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-green-700/50">
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>{langUI.options}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={clearConversation}>
                                        {langUI.clearConversation}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>

                    {error && (
                        <Alert variant="destructive" className="m-2 rounded-xl">
                            <AlertTitle>{langUI.errorTitle}</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <CardContent className="flex-1 flex flex-col p-4 overflow-hidden relative bg-gradient-to-b from-gray-50 to-white">
                        <div
                            className="flex-1 overflow-y-auto space-y-3 mb-20 pr-2"
                            style={{
                                maxHeight: 'calc(100vh - 350px)',
                                height: 'calc(100vh - 350px)'
                            }}
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'bot'
                                        ? 'justify-start'
                                        : 'justify-end'
                                        } mb-2`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="mr-2 self-end">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage
                                                    src="/ai-avatar.png"
                                                    alt="AI Assistant"
                                                />
                                                <AvatarFallback className="bg-green-100">
                                                    <Tractor className="h-4 w-4 text-green-600" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                    <div
                                        className={`
                      max-w-[85%] md:max-w-[70%] p-4 rounded-2xl 
                      ${msg.sender === 'bot'
                                                ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                                                : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg'
                                            }
                      whitespace-pre-wrap break-words
                    `}
                                    >
                                        <MarkdownComponent content={msg.text} />
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="ml-2 self-end">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage
                                                    src={user?.user_metadata?.avatar_url}
                                                    alt={user?.user_metadata?.full_name || 'User Profile'}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isSending && (
                                <div className="flex justify-start items-center">
                                    <Avatar className="w-8 h-8 mr-2">
                                        <AvatarImage
                                            src="/ai-avatar.png"
                                            alt="AI Assistant"
                                        />
                                        <AvatarFallback className="bg-green-100">
                                            <Tractor className="h-4 w-4 text-green-600" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white text-gray-800 p-4 rounded-2xl flex items-center shadow-sm border border-gray-100">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-green-600" />
                                        {langUI.thinking}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Fixed bottom input area */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                            <div className="flex space-x-2">
                                <Input
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={langUI.placeholder}
                                    className="flex-grow border-gray-200 focus:border-green-500 focus:ring-green-500 h-12 rounded-xl"
                                    disabled={isSending}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 h-12 px-6 rounded-xl"
                                    disabled={isSending || inputMessage.trim() === ''}
                                >
                                    {isSending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}