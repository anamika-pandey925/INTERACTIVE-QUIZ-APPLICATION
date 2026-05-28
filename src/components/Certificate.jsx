import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Award, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Certificate({ 
  userName = "Alex Johnson", 
  score = "95%", 
  quizCategory = "JavaScript Advanced",
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}) {
  const certificateRef = useRef(null);
  const [certId, setCertId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Generate a pseudo-random unique certificate ID
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let id = 'CERT-';
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };
    setCertId(generateId());
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions (A4 landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save PDF
      pdf.save(`${userName.replace(/\s+/g, '_')}_${quizCategory.replace(/\s+/g, '_')}_Certificate.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
      <div className="mb-6 flex justify-between items-center w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <CheckCircle className="text-green-500" />
          Quiz Completed Successfully!
        </h2>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-[#2e7d32] hover:bg-[#218838] text-white px-5 py-2.5 rounded-lg shadow-md transition-colors font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Certificate Wrapper - with specific fixed dimensions for consistent PDF generation */}
      <div className="w-full max-w-4xl overflow-x-auto pb-4 custom-scrollbar">
        <div 
          className="relative min-w-[800px] bg-white p-2 shadow-2xl mx-auto"
          style={{ width: '800px', height: '566px' }} // Standard aspect ratio for A4 Landscape
        >
          {/* Outer Border */}
          <div className="absolute inset-2 border-[12px] border-[#2e7d32] rounded-sm pointer-events-none z-10 opacity-90"></div>
          
          {/* Inner Border */}
          <div className="absolute inset-5 border-2 border-dashed border-[#a5d6a7] pointer-events-none z-10"></div>

          {/* Certificate Content */}
          <div 
            ref={certificateRef}
            className="relative w-full h-full bg-white flex flex-col items-center justify-center px-16 py-12 text-center text-gray-800"
            style={{ 
              backgroundImage: 'radial-gradient(circle at center, #f0fdf4 0%, #ffffff 70%)'
            }}
          >
            {/* Background Watermark/Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award size={400} />
            </div>

            {/* Header Section */}
            <div className="mb-6 flex flex-col items-center z-20">
              <div className="flex items-center justify-center w-16 h-16 bg-[#2e7d32] text-white rounded-full mb-4 shadow-lg">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-4xl font-serif font-bold text-[#1b5e20] tracking-widest uppercase mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Certificate of Achievement
              </h1>
              <div className="w-64 h-1 bg-gradient-to-r from-transparent via-[#2e7d32] to-transparent mb-2"></div>
              <p className="text-sm tracking-[0.2em] text-gray-500 uppercase font-semibold">
                This acknowledges that
              </p>
            </div>

            {/* Recipient Name */}
            <div className="my-4 z-20 w-full">
              <h2 className="text-5xl font-bold text-gray-900 capitalize" style={{ fontFamily: 'Georgia, serif', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', display: 'inline-block', minWidth: '400px' }}>
                {userName}
              </h2>
            </div>

            {/* Body Text */}
            <div className="my-6 z-20 max-w-xl">
              <p className="text-lg text-gray-700 leading-relaxed">
                has successfully completed the <span className="font-bold text-[#1b5e20]">{quizCategory}</span> assessment 
                with an outstanding score of <span className="font-bold text-[#1b5e20]">{score}</span>.
              </p>
            </div>

            {/* Footer Section - Signatures and Details */}
            <div className="mt-10 w-full flex justify-between items-end px-10 z-20">
              
              {/* Date */}
              <div className="flex flex-col items-center w-48">
                <span className="text-lg font-medium text-gray-800 border-b border-gray-400 w-full text-center pb-1">
                  {date}
                </span>
                <span className="text-xs text-gray-500 uppercase mt-2 font-semibold tracking-wider">Date of Issue</span>
              </div>

              {/* Seal/Badge */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="absolute w-24 h-24 bg-[#ffc107] rounded-full opacity-20 animate-pulse"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-[#ffc107] to-[#ff9800] rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white relative z-10">
                  <Award size={32} className="text-white mb-1" />
                  <span className="text-[10px] text-white font-bold text-center leading-tight shadow-sm">CERTIFIED<br/>EXCELLENCE</span>
                </div>
              </div>

              {/* Signature */}
              <div className="flex flex-col items-center w-48">
                <div className="h-10 w-full flex items-end justify-center border-b border-gray-400 pb-1">
                  <span className="font-mono text-xl italic text-gray-800" style={{ fontFamily: "'Brush Script MT', cursive" }}>CodTech Admin</span>
                </div>
                <span className="text-xs text-gray-500 uppercase mt-2 font-semibold tracking-wider">Authorized Signature</span>
              </div>
              
            </div>

            {/* Certificate ID */}
            <div className="absolute bottom-6 left-6 text-xs text-gray-400 font-mono z-20">
              ID: {certId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
