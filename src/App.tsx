import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ExternalLink,
  Loader2,
  X,
  ArrowRight,
  ChevronRight,
  FileText,
  BarChart3,
  MapPin,
  CheckCircle2,
  Sparkles,
  Zap,
  Copy,
  Check,
  Download,
  DownloadCloud,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { University } from './types';

export default function App() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filter, setFilter] = useState<'all' | 'essay' | 'short' | 'no_min'>('all');
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [analysis, setAnalysis] = useState<{ type: '2026' | '2027', content: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/universities');
      const data = await res.json();
      setUniversities(data);
    } catch (err) {
      console.error('Failed to fetch universities', err);
    }
  };

  const filteredUnis = universities.filter(uni => {
    if (filter === 'all') return true;
    if (filter === 'essay') return uni.type === 'essay';
    if (filter === 'short') return uni.type === 'short';
    if (filter === 'no_min') return uni.csat_min === '없음';
    return true;
  });

  const generateAnalysis = async (type: '2026' | '2027', uni: University) => {
    setIsGenerating(true);
    setAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = type === '2026' 
        ? `${uni.name}의 2026학년도 수리논술 기출 정밀 분석을 수행해줘. 주요 출제 단원, 난이도 변화, 합격자들의 주요 특징 등을 포함해서 아주 상세하게 작성해줘.`
        : `${uni.name}의 2027학년도 수리논술 합격 전략을 세워줘. 내신 반영 비율, 수능 최저 학력 기준(${uni.csat_min})에 따른 대비법, 월별 학습 로드맵 등을 포함해서 아주 상세하게 작성해줘.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setAnalysis({ type, content: response.text || "분석 내용을 생성할 수 없습니다." });
    } catch (err) {
      console.error('Gemini API error', err);
      setAnalysis({ type, content: "오류가 발생했습니다. 다시 시도해주세요." });
    } finally {
      setIsGenerating(false);
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!analysis || !selectedUni) return;
    const title = analysis.type === '2026' ? '2026 기출 정밀 분석' : '2027 합격 전략';
    const content = `[${selectedUni.name}] ${title}\n\n${analysis.content}`;
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadAnalysis = () => {
    if (!analysis || !selectedUni) return;
    
    const title = analysis.type === '2026' ? '2026 기출 정밀 분석' : '2027 합격 전략';
    const content = `[${selectedUni.name}] ${title}\n\n${analysis.content}`;
    
    // Clean filename
    const safeFileName = `${selectedUni.name}_${analysis.type}_분석.txt`.replace(/[/\\?%*:|"<>]/g, '-');
    
    // Use Data URI instead of Blob for better iframe compatibility
    const encodedContent = encodeURIComponent(content);
    const dataUri = `data:text/plain;charset=utf-8,${encodedContent}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', safeFileName);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pieData = [
    { name: '전통 수리논술', value: 29, color: '#2563EB' },
    { name: '약술형 (Short-answer)', value: 15, color: '#10B981' },
    { name: '메디컬/기타 전문', value: 5, color: '#F59E0B' },
  ];

  const barData = [
    { name: '고려대(4합8)', value: 4, color: '#EF4444' },
    { name: '한양대(3합7)', value: 3.5, color: '#3B82F6' },
    { name: '중앙대(3합6)', value: 3, color: '#60A5FA' },
    { name: '경희대(2합5)', value: 2.5, color: '#93C5FD' },
    { name: '국민대(2합6)', value: 2, color: '#10B981' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Questio Lab 2027 논술전략 인텔리전스</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <button onClick={() => scrollToSection('data-report')} className="hover:text-blue-600 transition-colors">데이터 리포트</button>
            <button onClick={() => scrollToSection('uni-explorer')} className="hover:text-blue-600 transition-colors">44개 대학 탐색</button>
            <button onClick={() => scrollToSection('pass-roadmap')} className="hover:text-blue-600 transition-colors">합격 로드맵</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100"
          >
            <Zap size={14} />
            2027 Admission Total Guide
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight"
          >
            전국 <span className="text-blue-600 italic">44개 대학</span> 수리논술<br />
            데이터로 선점하라
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            내신의 영향력이 사라진 2027학년도, 합격의 실질적인 열쇠는<br />
            <span className="text-slate-900 font-semibold border-b-2 border-blue-400">대학별 기출 유형 정복</span>과 <span className="text-slate-900 font-semibold border-b-2 border-emerald-400">전략적 최저 사수</span>에 있습니다.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => setFilter('essay')}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              논술형 대학 (29개) 보기
            </button>
            <button 
              onClick={() => setFilter('short')}
              className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
            >
              약술형 대학 (15개) 보기
            </button>
          </motion.div>
        </div>
      </section>

      {/* 1. Data Report Section */}
      <section id="data-report" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">1. 2027 거시적 입시 지표</h3>
            <p className="text-xl text-slate-500 italic font-medium">왜 올해는 논술이 기회인가?</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">논술 100% 대학</p>
                <p className="text-xl font-black text-slate-900">28개교</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">약술형 신설</p>
                <p className="text-xl font-black text-slate-900">2개교</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Donut */}
          <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <PieIcon className="text-blue-600" size={20} />
              <h4 className="text-lg font-bold text-slate-800">논술 전형 유형별 비중 (대학 수)</h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                2027학년도는 전통적인 수리논술 외에도 <span className="font-bold text-slate-900">**가천대, 국민대**</span>를 필두로 한 약술형 논술의 비중이 확대되었습니다. 이는 중위권 학생들에게 폭발적인 기회를 제공합니다.
              </p>
            </div>
          </div>

          {/* Chart 2: Bar */}
          <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-orange-500" size={20} />
              <h4 className="text-lg font-bold text-slate-800">상위권 수능 최저 허들 (평균 등급)</h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis hide />
                  <RechartsTooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                고려대와 성균관대 의예과는 수능 최저 충족이 곧 합격이라 할 만큼 강력한 필터를 유지합니다. 반면 한양대의 최저 신설은 실질 경쟁률을 획기적으로 낮출 변수입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. University Explorer */}
      <section id="uni-explorer" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">2. 전국 44개 대학 실전 탐색기</h3>
            <p className="text-slate-500">카드를 클릭하여 대학별 2026 기출 분석과 2027 합격 전략을 확인하세요.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {[
              { id: 'all', label: '전체' },
              { id: 'essay', label: '논술형(29)' },
              { id: 'short', label: '약술형(15)' },
              { id: 'no_min', label: '최저없음' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filter === t.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUnis.map((uni, idx) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedUni(uni)}
              className="group bg-white border border-slate-200 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-blue-100 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uni.category}</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-8 group-hover:text-blue-600 transition-colors">{uni.name}</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reflection</p>
                  <p className="text-xl font-black text-slate-800">{uni.reflection}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CSAT Min</p>
                  <p className={`text-xl font-black ${uni.csat_min === '없음' ? 'text-slate-400' : 'text-rose-500'}`}>{uni.csat_min}</p>
                </div>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-2xl group-hover:bg-blue-600 transition-colors">
                Strategy Analysis
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUni && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedUni(null);
                setAnalysis(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-10 text-white relative">
                <button 
                  onClick={() => {
                    setSelectedUni(null);
                    setAnalysis(null);
                  }}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <span>{selectedUni.category}</span>
                  <span className="opacity-30">/</span>
                  <span>{selectedUni.type === 'essay' ? '표준 수리논술' : '약술형 수리논술'}</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight">{selectedUni.name}</h2>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <span className="text-xl font-bold text-slate-800">논술 {selectedUni.reflection} : 학생부 {100 - parseInt(selectedUni.reflection)}%</span>
                  </div>
                  <div className={`text-xl font-black ${selectedUni.csat_min === '없음' ? 'text-slate-300' : 'text-rose-500'}`}>
                    {selectedUni.csat_min}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => generateAnalysis('2026', selectedUni)}
                    disabled={isGenerating}
                    className="flex items-center justify-between p-6 bg-blue-50 border border-blue-100 rounded-3xl group hover:bg-blue-600 transition-all"
                  >
                    <div className="text-left">
                      <p className="text-blue-600 font-bold group-hover:text-white transition-colors">2026 기출 정밀 분석</p>
                      <p className="text-xs text-blue-400 group-hover:text-blue-100 transition-colors">과거 데이터 기반 정밀 진단</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <BarChart3 size={20} />
                    </div>
                  </button>
                  <button 
                    onClick={() => generateAnalysis('2027', selectedUni)}
                    disabled={isGenerating}
                    className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-3xl group hover:bg-emerald-600 transition-all"
                  >
                    <div className="text-left">
                      <p className="text-emerald-600 font-bold group-hover:text-white transition-colors">2027 합격 전략</p>
                      <p className="text-xs text-emerald-400 group-hover:text-emerald-100 transition-colors">미래 대비 맞춤형 로드맵</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Zap size={20} />
                    </div>
                  </button>
                </div>

                {/* Analysis Result */}
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-slate-50 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <Loader2 className="animate-spin text-blue-600" size={40} />
                      <p className="text-slate-500 font-medium">인공지능이 데이터를 정밀 분석 중입니다...</p>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-blue-600 rounded-full" />
                        <h3 className="text-2xl font-bold text-slate-800">
                          {analysis.type === '2026' ? '2026 기출 정밀 분석' : '2027 합격 전략'}
                        </h3>
                      </div>
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {analysis.content}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={downloadAnalysis}
                          className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                          <Download size={18} />
                          파일 다운로드
                        </button>
                        <button 
                          onClick={copyToClipboard}
                          className={`flex items-center justify-center gap-2 py-4 border font-bold rounded-2xl transition-all ${
                            isCopied 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isCopied ? <Check size={18} /> : <Copy size={18} />}
                          {isCopied ? '복사 완료!' : '텍스트 복사'}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-slate-50 rounded-3xl p-12 text-center">
                      <p className="text-slate-400 font-medium">상단의 버튼을 눌러 분석을 시작하세요.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 flex justify-center">
                <button 
                  onClick={() => {
                    setSelectedUni(null);
                    setAnalysis(null);
                  }}
                  className="px-12 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors"
                >
                  전략 분석 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Pass Roadmap Section */}
      <section id="pass-roadmap" className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-slate-900 rounded-[48px] p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.15),transparent_50%)]" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 italic tracking-tight">Questio's Success Strategy</h3>
            <p className="text-blue-400 font-bold text-lg mb-16">퀘스티오가 제안하는 2027 수리논술 합격 공식 3요소</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Microscope className="text-blue-400" size={32} />,
                  title: "연세대/경희대 과학 대응",
                  desc: "연세대의 '통합과학' 기반 서논술형은 깊이보다 **개념의 연결성**이 핵심입니다. 공통 과학 교과서의 실험 탐구 과정을 수학적 수식으로 정리하는 연습이 필요합니다."
                },
                {
                  icon: <FileText className="text-orange-400" size={32} />,
                  title: "약술형 EBS 무한 반복",
                  desc: "가천대, 국민대 등 15개 약술형 대학은 **EBS 수능특강의 숫자 변형** 수준입니다. 풀이 과정을 3줄 이내로 간결하고 논리적으로 쓰는 훈련이 합격을 보장합니다."
                },
                {
                  icon: <ShieldCheck className="text-emerald-400" size={32} />,
                  title: "전략적 최저 사수",
                  desc: "성균관대의 탐구 2과목 평균 반영은 강력한 변수입니다. 44개 대학 중 본인의 강점 영역(수학 vs 탐구)에 따른 최저 기준을 분석하여 **실질 경쟁률이 낮은 곳**을 공략하세요."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-10 text-left hover:bg-white/10 transition-all group">
                  <div className="mb-8 p-4 bg-white/5 rounded-2xl inline-block group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-6">{item.title}</h4>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {item.desc.split('**').map((part, i) => i % 2 === 1 ? <span key={i} className="text-white font-bold">{part}</span> : part)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-slate-400">QUESTIO LAB 2027 ESSAY STRATEGY INTELLIGENCE</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Admission Data Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
