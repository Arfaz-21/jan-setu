import React, { useState, useEffect } from 'react';
import {
  Volume2, VolumeX, Play, Pause, RotateCcw,
  Languages, Sparkles, CheckCircle2, AlertTriangle,
  HelpCircle, Info, Radio
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const KannadaVoiceAssistant: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const [phrases, setPhrases] = useState<any[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<any | null>(null);
  const [speakingPhraseId, setSpeakingPhraseId] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.9);

  useEffect(() => {
    api.getVoiceStatus().then(setVoiceStatus).catch(console.error);
    api.getKannadaPhrases().then(setPhrases).catch(console.error);
  }, []);

  const speakText = (text: string, phraseId?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support SpeechSynthesis voice audio.');
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingPhraseId === phraseId) {
      setSpeakingPhraseId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingPhraseId(null);
    };

    utterance.onerror = () => {
      setSpeakingPhraseId(null);
    };

    if (phraseId) {
      setSpeakingPhraseId(phraseId);
    }
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingPhraseId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accessibility & Inclusion Interface</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ (Kannada Voice Assistant)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Spoken audio instructions for Karnataka welfare applicants and Kannada-first citizens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              <span>Toggle to {language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* BHASHINI STATUS BADGE */}
        {voiceStatus && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>
                <strong>Voice Engine:</strong> {voiceStatus.provider}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {voiceStatus.status_message}
            </span>
          </div>
        )}
      </div>

      {/* AUDIO CONTROL BAR */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-teal-400" />
          <span className="font-semibold">Kannada Speech Synthesis Controller</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Speed:</span>
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1 text-xs"
            >
              <option value="0.8">0.8x (Slow)</option>
              <option value="0.9">0.9x (Natural)</option>
              <option value="1.0">1.0x (Standard)</option>
            </select>
          </div>

          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Stop Audio</span>
          </button>
        </div>
      </div>

      {/* CURATED KANNADA DOCUMENT GUIDANCE CARDS */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">
          Pre-Configured Document Guidance Messages
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {phrases.map((phrase) => {
            const isPlaying = speakingPhraseId === phrase.id;

            return (
              <div
                key={phrase.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition ${
                  isPlaying ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {phrase.category}
                    </span>

                    {/* Kannada Text */}
                    <div className="text-lg font-bold text-slate-900 leading-relaxed font-sans">
                      {phrase.kannada_text}
                    </div>

                    {/* Phonetic Pronunciation Guide */}
                    <div className="text-xs text-teal-800 font-mono bg-teal-50/60 p-2 rounded border border-teal-100">
                      <strong>Phonetic:</strong> {phrase.phonetic_kannada}
                    </div>

                    {/* English Translation */}
                    <div className="text-xs text-slate-600 border-t border-slate-100 pt-2">
                      <strong className="text-slate-800">English Translation: </strong>
                      <span>{phrase.english_translation}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => speakText(phrase.kannada_text, phrase.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold text-xs transition shadow-xs ${
                      isPlaying
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Read Aloud'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM TEXT-TO-SPEECH TESTER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">
          Custom Kannada Speech Tester
        </h3>
        <p className="text-xs text-slate-500">
          Type or paste any Kannada text to test local browser speech synthesis without external cloud billing.
        </p>

        <textarea
          rows={3}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="ನಿಮ್ಮ ಕಸ್ಟಮ್ ಕನ್ನಡ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
          className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 font-sans"
        />

        <div className="flex justify-end">
          <button
            onClick={() => speakText(customText || 'ಜನ ಸೇತು ಕರ್ನಾಟಕ ನಾಗರಿಕರ ಸೇವೆಗಾಗಿ ಸದಾ ಸಿದ್ಧವಾಗಿದೆ.', 'custom')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Speak Custom Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
