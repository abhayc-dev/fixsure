"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square } from "lucide-react";

// Provide a basic utility function if cn is not available and we can't find it.
// Assuming next.js project with typical setup.
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export interface VoiceTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onVoiceInput?: (text: string) => void;
}

export const VoiceTextarea = React.forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
    ({ className, defaultValue, value, onChange, onVoiceInput, ...props }, ref) => {
        const [isListening, setIsListening] = useState(false);
        const [recognition, setRecognition] = useState<any>(null);
        const [interimText, setInterimText] = useState("");
        const [supportStatus, setSupportStatus] = useState<'checking' | 'supported' | 'unsupported'>('checking');

        const internalRef = useRef<HTMLTextAreaElement | null>(null);
        const isListeningRef = useRef(isListening);
        const stopRequestedRef = useRef(false);

        useEffect(() => {
            isListeningRef.current = isListening;
        }, [isListening]);

        // Merge refs manually
        const handleRef = (el: HTMLTextAreaElement | null) => {
            internalRef.current = el;
            if (typeof ref === "function") {
                ref(el);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            }
        };

        useEffect(() => {
            if (typeof window !== "undefined") {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (SpeechRecognition) {
                    const rec = new SpeechRecognition();
                    rec.continuous = true;
                    rec.interimResults = true;
                    // For hinglish to english characters
                    rec.lang = "en-IN";
                    setRecognition(rec);
                    setSupportStatus('supported');
                } else {
                    setSupportStatus('unsupported');
                }
            }
        }, []);

        const appendTextToTextarea = useCallback((newText: string) => {
            if (!internalRef.current) return;

            const textarea = internalRef.current;
            const startPos = textarea.selectionStart;
            const endPos = textarea.selectionEnd;
            const currentValue = textarea.value;

            const textBefore = currentValue.substring(0, startPos);
            const textAfter = currentValue.substring(endPos, currentValue.length);

            const padding = (textBefore.length > 0 && !textBefore.endsWith(" ") && !textBefore.endsWith("\n")) ? " " : "";
            const textToAppend = newText.trim();
            const suffixPadding = textToAppend.length > 0 && textAfter.length > 0 && !textAfter.startsWith(" ") && !textAfter.startsWith("\n") ? " " : "";

            const newValue = textBefore + padding + textToAppend + suffixPadding + textAfter;

            textarea.value = newValue;

            // Move cursor ahead
            const newPos = startPos + padding.length + textToAppend.length;
            textarea.setSelectionRange(newPos, newPos);

            // Dispatch input event to simulate user typing so parent components catch the change
            const event = new Event("input", { bubbles: true });
            textarea.dispatchEvent(event);

            if (onChange) {
                const syntheticEvent = Object.create(event);
                syntheticEvent.target = textarea;
                syntheticEvent.currentTarget = textarea;
                onChange(syntheticEvent as any);
            }

            if (onVoiceInput) {
                onVoiceInput(newValue);
            }
        }, [onChange, onVoiceInput]);

        useEffect(() => {
            if (!recognition) return;

            recognition.onresult = (event: any) => {
                let finalTranscript = "";
                let currentInterim = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        currentInterim += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    appendTextToTextarea(finalTranscript);
                }

                setInterimText(currentInterim);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error !== 'no-speech') {
                    setIsListening(false);
                    stopRequestedRef.current = true;
                    setInterimText("");
                }
            };

            recognition.onend = () => {
                if (isListeningRef.current && !stopRequestedRef.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        setIsListening(false);
                        setInterimText("");
                    }
                } else {
                    setIsListening(false);
                    setInterimText("");
                }
            };

        }, [recognition, appendTextToTextarea]);

        const toggleListening = useCallback(() => {
            if (isListening) {
                stopRequestedRef.current = true;
                setIsListening(false);
                if (recognition) {
                    try {
                        recognition.stop();
                    } catch (e) { }
                }
                setInterimText("");
            } else {
                if (recognition) {
                    try {
                        stopRequestedRef.current = false;
                        recognition.start();
                        setIsListening(true);
                        setInterimText("");
                        if (internalRef.current) {
                            internalRef.current.focus();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    alert("Speech recognition is not supported in this browser.");
                }
            }
        }, [isListening, recognition]);

        return (
            <div className="relative group/voice w-full flex flex-col items-stretch">
                <textarea
                    ref={handleRef}
                    defaultValue={defaultValue}
                    value={value}
                    onChange={onChange}
                    className={cn(className, interimText ? "pb-8" : "pb-4")}
                    {...props}
                />

                {supportStatus === 'supported' && (
                    <div className="absolute right-3 bottom-3 flex items-center gap-2 z-10">
                        {isListening ? (
                            <div className="flex items-center gap-2 sm:gap-3 bg-white border border-slate-200 p-1.5 rounded-full shadow-lg shadow-indigo-100/50">
                                <div className="relative flex h-10 w-10 items-center justify-center bg-rose-500 text-white rounded-full shadow-inner">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <Mic className="h-5 w-5 relative animate-pulse" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 animate-pulse hidden sm:inline-block">Listening...</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleListening();
                                    }}
                                    className="p-2.5 mr-1 bg-slate-100 hover:bg-rose-100 text-slate-700 rounded-full transition-colors group focus:outline-none"
                                    title="Stop listening"
                                >
                                    <Square className="h-4 w-4 fill-current text-slate-500 group-hover:text-rose-600 transition-colors" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleListening();
                                }}
                                className="p-2 rounded-full transition-all duration-300 shadow-sm border focus:outline-none bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50"
                                title="Start voice typing"
                            >
                                <Mic className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}

                {interimText && (
                    <div className="absolute left-3 bottom-4 text-[12px] text-slate-400 italic pointer-events-none animate-pulse truncate px-2 py-1 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-50 shadow-sm inline-block w-fit max-w-[50%]">
                        listening: <span className="text-indigo-500 font-medium">{interimText}</span>
                    </div>
                )}
            </div>
        );
    }
);

VoiceTextarea.displayName = "VoiceTextarea";
