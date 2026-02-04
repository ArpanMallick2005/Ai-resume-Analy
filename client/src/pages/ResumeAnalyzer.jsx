import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, Search } from 'lucide-react';
import pdfToText from 'react-pdftotext';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import toast from 'react-hot-toast';
import Loader from '../components/Loader.jsx';

const ResumeAnalyzer = () => {
    const { token } = useSelector(state => state.auth);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setAnalysis(null);
        } else {
            toast.error("Please upload a valid PDF file");
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast.error("Please upload a resume first");
            return;
        }

        setLoading(true);
        try {
            console.log("pdfToText value:", pdfToText);
            const extractText = typeof pdfToText === 'function' ? pdfToText : (pdfToText && pdfToText.default);
            
            if (typeof extractText !== 'function') {
                console.error("PDF extraction library not loaded correctly. Value:", pdfToText);
                throw new Error("PDF extraction library not loaded correctly. Please refresh the page.");
            }
            
            const text = await extractText(file);
            console.log("Extracted text length:", text.length);
            const response = await api.post('/api/ai/analyze-resume', { resumeText: text }, { headers: { Authorization: token } });
            setAnalysis(response.data);
            toast.success("Analysis complete!");
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to analyze resume. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 50) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Resume Analyzer</h1>
                <p className="text-lg text-gray-600">Upload your resume to get an instant ATS score and professional feedback.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Upload className="text-blue-600" size={20} />
                            Upload Resume
                        </h2>
                        <div 
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                            onClick={() => document.getElementById('resume-upload').click()}
                        >
                            <input 
                                type="file" 
                                id="resume-upload" 
                                className="hidden" 
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            <FileText className={`mx-auto mb-4 ${file ? 'text-blue-600' : 'text-gray-400'}`} size={40} />
                            <p className="text-sm text-gray-600 font-medium">
                                {file ? file.name : 'Click to upload PDF'}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">Only PDF files supported</p>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className={`w-full mt-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!file || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
                        >
                            {loading ? <Loader size={20} color="border-white" fullScreen={false} /> : <Search size={18} />}
                            {loading ? 'Analyzing...' : 'Analyze Resume'}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="md:col-span-2">
                    {analysis ? (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <div className={`p-8 rounded-2xl border ${getScoreBg(analysis.ats_score)} border-opacity-50 flex items-center justify-between`}>
                                <div>
                                    <h3 className="text-gray-700 font-medium mb-1">ATS Compatibility Score</h3>
                                    <p className="text-sm text-gray-500">Based on professional recruitment standards</p>
                                </div>
                                <div className={`text-5xl font-black ${getScoreColor(analysis.ats_score)}`}>
                                    {analysis.ats_score}%
                                </div>
                            </div>

                            {/* Detailed Analysis */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="text-blue-600" size={20} />
                                        Overall Summary
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-md font-bold text-green-700 mb-3 flex items-center gap-2">
                                            <CheckCircle size={18} />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-2">
                                            {analysis.strengths.map((item, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex gap-2">
                                                    <span className="text-green-500">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-md font-bold text-red-700 mb-3 flex items-center gap-2">
                                            <AlertCircle size={18} />
                                            Weaknesses
                                        </h3>
                                        <ul className="space-y-2">
                                            {analysis.weaknesses.map((item, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex gap-2">
                                                    <span className="text-red-500">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Improvement Plan</h3>
                                    <div className="space-y-3">
                                        {analysis.suggestions.map((item, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <Search className="text-gray-300" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to analyze</h3>
                            <p className="text-gray-400 max-w-xs">Upload your resume and click the button to see your detailed ATS report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;