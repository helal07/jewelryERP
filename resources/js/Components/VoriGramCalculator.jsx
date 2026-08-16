import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useLanguage } from '@/Context/LanguageContext';
import { RefreshCw, Calculator, ArrowRightLeft } from 'lucide-react';

export default function VoriGramCalculator({ show, onClose }) {
    const { t, lang } = useLanguage();
    const isBn = lang === 'bn';

    const [vori, setVori] = useState('');
    const [ana, setAna] = useState('');
    const [roti, setRoti] = useState('');
    const [point, setPoint] = useState('');
    
    const [gram, setGram] = useState('');

    const [activeInput, setActiveInput] = useState('traditional'); // 'traditional' or 'gram'

    // Constants
    const GRAMS_PER_VORI = 11.6638;
    const ANAS_PER_VORI = 16;
    const ROTIS_PER_ANA = 6;
    const POINTS_PER_ROTI = 10;

    // Convert traditional to gram
    const calculateGram = () => {
        const v = parseFloat(vori) || 0;
        const a = parseFloat(ana) || 0;
        const r = parseFloat(roti) || 0;
        const p = parseFloat(point) || 0;

        // Convert everything to Vori
        let totalVori = v;
        totalVori += a / ANAS_PER_VORI;
        totalVori += r / (ANAS_PER_VORI * ROTIS_PER_ANA);
        totalVori += p / (ANAS_PER_VORI * ROTIS_PER_ANA * POINTS_PER_ROTI);

        const totalGram = totalVori * GRAMS_PER_VORI;
        setGram(totalGram > 0 ? totalGram.toFixed(3) : '');
    };

    // Convert gram to traditional
    const calculateTraditional = () => {
        const g = parseFloat(gram) || 0;
        
        let totalVori = g / GRAMS_PER_VORI;
        
        let v = Math.floor(totalVori);
        let remainder = totalVori - v;
        
        let totalAnas = remainder * ANAS_PER_VORI;
        let a = Math.floor(totalAnas);
        remainder = totalAnas - a;
        
        let totalRotis = remainder * ROTIS_PER_ANA;
        let r = Math.floor(totalRotis);
        remainder = totalRotis - r;
        
        let totalPoints = remainder * POINTS_PER_ROTI;
        let p = Math.round(totalPoints);

        // Handle rounding overflow
        if (p >= POINTS_PER_ROTI) {
            p = 0;
            r += 1;
        }
        if (r >= ROTIS_PER_ANA) {
            r = 0;
            a += 1;
        }
        if (a >= ANAS_PER_VORI) {
            a = 0;
            v += 1;
        }

        setVori(v > 0 ? v.toString() : '');
        setAna(a > 0 ? a.toString() : '');
        setRoti(r > 0 ? r.toString() : '');
        setPoint(p > 0 ? p.toString() : '');
    };

    useEffect(() => {
        if (activeInput === 'traditional') {
            calculateGram();
        }
    }, [vori, ana, roti, point]);

    useEffect(() => {
        if (activeInput === 'gram') {
            calculateTraditional();
        }
    }, [gram]);

    const resetCalculator = () => {
        setVori('');
        setAna('');
        setRoti('');
        setPoint('');
        setGram('');
        setActiveInput('traditional');
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 bg-[#FEF9E7] border-b border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {isBn ? 'ভরি / গ্রাম ক্যালকুলেটর' : 'Vori / Gram Calculator'}
                    </h2>
                </div>
                <p className="text-sm text-gray-600">
                    {isBn ? 'স্বর্ণের ওজন ভরি বা গ্রামে রূপান্তর করুন।' : 'Convert gold weight between Vori and Grams.'}
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Traditional Input */}
                <div 
                    className={`p-4 rounded-xl border-2 transition-colors ${activeInput === 'traditional' ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    onClick={() => setActiveInput('traditional')}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900">{isBn ? 'সনাতন হিসাব (ভরি)' : 'Traditional (Vori)'}</h3>
                        {activeInput === 'traditional' && <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div>
                            <InputLabel value={isBn ? 'ভরি' : 'Vori'} />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full text-center"
                                value={vori}
                                onChange={(e) => setVori(e.target.value)}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div>
                            <InputLabel value={isBn ? 'আনা' : 'Ana'} />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full text-center"
                                value={ana}
                                onChange={(e) => setAna(e.target.value)}
                                placeholder="0"
                                min="0"
                                max="15"
                            />
                        </div>
                        <div>
                            <InputLabel value={isBn ? 'রতি' : 'Roti'} />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full text-center"
                                value={roti}
                                onChange={(e) => setRoti(e.target.value)}
                                placeholder="0"
                                min="0"
                                max="5"
                            />
                        </div>
                        <div>
                            <InputLabel value={isBn ? 'পয়েন্ট' : 'Point'} />
                            <TextInput
                                type="number"
                                className="mt-1 block w-full text-center"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                                placeholder="0"
                                min="0"
                                max="9"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 text-amber-500">
                        <ArrowRightLeft className="w-5 h-5 rotate-90" />
                    </div>
                </div>

                {/* Gram Input */}
                <div 
                    className={`p-4 rounded-xl border-2 transition-colors ${activeInput === 'gram' ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    onClick={() => setActiveInput('gram')}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900">{isBn ? 'গ্রাম হিসাব' : 'Gram Calculation'}</h3>
                        {activeInput === 'gram' && <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>}
                    </div>
                    <div>
                        <TextInput
                            type="number"
                            className="block w-full text-lg font-bold text-center h-12"
                            value={gram}
                            onChange={(e) => setGram(e.target.value)}
                            placeholder="0.000"
                            step="0.001"
                            min="0"
                        />
                        <div className="text-center mt-2 text-xs text-gray-500">
                            {isBn ? '১ ভরি = ১১.৬৬৩৮ গ্রাম' : '1 Vori = 11.6638 Grams'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-lg">
                <button 
                    onClick={resetCalculator}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {isBn ? 'রিসেট' : 'Reset'}
                </button>
                <PrimaryButton onClick={onClose} className="bg-gray-800 hover:bg-gray-700">
                    {isBn ? 'বন্ধ করুন' : 'Close'}
                </PrimaryButton>
            </div>
        </Modal>
    );
}
