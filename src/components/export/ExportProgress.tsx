import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatTime, calculateProgress } from '@/types';

export function ExportProgress() {
  const { exams, studyEntries, getExamProgress, getOverallProgress } = useApp();
  const [exportType, setExportType] = useState<'all' | 'exam'>('all');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const isDisabled = exportType === 'exam' && !selectedExamId;

  const generateCSVData = () => {
    const headers = ['Date', 'Exam', 'Category', 'Description', 'Type', 'Quantity', 'Unit', 'Marks Obtained', 'Marks Total', 'Percentage'];
    
    let entries = studyEntries;
    if (exportType === 'exam' && selectedExamId) {
      entries = studyEntries.filter(e => e.examId === selectedExamId);
    }

    const rows = entries.map(entry => {
      const exam = exams.find(e => e.id === entry.examId);
      const category = exam?.categories.find(c => c.id === entry.categoryId);
      const isTime = category?.targetType === 'time';
      const hasMarks = entry.marks;
      
      return [
        entry.date,
        exam?.name || 'Unknown',
        category?.name || 'Unknown',
        `"${entry.description.replace(/"/g, '""')}"`,
        category?.targetType || 'Unknown',
        isTime ? formatTime(entry.quantity) : entry.quantity,
        category?.unit || '',
        hasMarks ? entry.marks!.obtained : '',
        hasMarks ? entry.marks!.total : '',
        hasMarks ? Math.round((entry.marks!.obtained / entry.marks!.total) * 100) + '%' : '',
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generatePDFContent = () => {
    const exportExams = exportType === 'exam' && selectedExamId 
      ? exams.filter(e => e.id === selectedExamId)
      : exams;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TrackPrep Progress Report</title>
  <style>
    @media print { @page { margin: 15mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1a1a1a; }
    h1 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    h3 { color: #666; }
    .summary-card { background: #f5f5f5; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .progress-bar { background: #e0e0e0; border-radius: 4px; height: 20px; overflow: hidden; margin: 5px 0; }
    .progress-fill { background: linear-gradient(90deg, #0066cc, #00cc99); height: 100%; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f0f0f0; }
    .stat { display: inline-block; margin-right: 30px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #0066cc; }
    .stat-label { font-size: 12px; color: #666; }
    .score-good { color: #00cc66; }
    .score-warning { color: #ffaa00; }
    .score-poor { color: #ff4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <h1>📚 TrackPrep Progress Report</h1>
  <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

  <div class="summary-card">
    <div class="stat">
      <div class="stat-value">${getOverallProgress()}%</div>
      <div class="stat-label">Overall Progress</div>
    </div>
    <div class="stat">
      <div class="stat-value">${exams.length}</div>
      <div class="stat-label">Exams</div>
    </div>
    <div class="stat">
      <div class="stat-value">${exams.reduce((sum, e) => sum + e.categories.length, 0)}</div>
      <div class="stat-label">Categories</div>
    </div>
    <div class="stat">
      <div class="stat-value">${studyEntries.length}</div>
      <div class="stat-label">Study Entries</div>
    </div>
  </div>
`;

    exportExams.forEach(exam => {
      const examProgress = getExamProgress(exam.id);
      const examEntries = studyEntries.filter(e => e.examId === exam.id);
      
      html += `
  <h2>${exam.name}</h2>
  ${exam.description ? `<p>${exam.description}</p>` : ''}
  ${exam.targetDate ? `<p><strong>Target Date:</strong> ${new Date(exam.targetDate).toLocaleDateString()}</p>` : ''}
  
  <div class="progress-bar">
    <div class="progress-fill" style="width: ${examProgress}%"></div>
  </div>
  <p><strong>${examProgress}% Complete</strong></p>

  <h3>Categories</h3>
  <table>
    <tr>
      <th>Category</th>
      <th>Type</th>
      <th>Progress</th>
      <th>Completed</th>
      <th>Target</th>
    </tr>
`;

      exam.categories.forEach(cat => {
        const catProgress = calculateProgress(cat.completedValue, cat.targetValue);
        const isTime = cat.targetType === 'time';
        
        html += `
    <tr>
      <td>${cat.name}</td>
      <td>${cat.targetType}</td>
      <td>${catProgress}%</td>
      <td>${isTime ? formatTime(cat.completedValue) : cat.completedValue} ${cat.unit}</td>
      <td>${isTime ? formatTime(cat.targetValue) : cat.targetValue} ${cat.unit}</td>
    </tr>
`;
      });

      html += `</table>`;

      const entriesWithMarks = examEntries.filter(e => e.marks);
      if (entriesWithMarks.length > 0) {
        html += `
  <h3>Test Scores</h3>
  <table>
    <tr>
      <th>Date</th>
      <th>Description</th>
      <th>Score</th>
      <th>Percentage</th>
    </tr>
`;
        entriesWithMarks.slice(-10).forEach(entry => {
          const percentage = Math.round((entry.marks!.obtained / entry.marks!.total) * 100);
          const scoreClass = percentage >= 80 ? 'score-good' : percentage >= 50 ? 'score-warning' : 'score-poor';
          
          html += `
    <tr>
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>${entry.description}</td>
      <td>${entry.marks!.obtained}/${entry.marks!.total}</td>
      <td class="${scoreClass}">${percentage}%</td>
    </tr>
`;
        });
        html += `</table>`;
      }
    });

    html += `
  <div class="footer">
    <p>Generated by TrackPrep - Your Study Progress Tracker</p>
  </div>
</body>
</html>
`;

    return html;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Small delay before cleanup for iOS Safari
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleExportCSV = () => {
    if (isExportingCSV) return;
    setIsExportingCSV(true);
    try {
      const csvData = generateCSVData();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `trackprep-progress-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    setPdfDone(false);
    try {
      const htmlContent = generatePDFContent();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      downloadBlob(blob, `trackprep-report-${new Date().toISOString().split('T')[0]}.html`);
      setPdfDone(true);
      toast.success('PDF report downloaded! Open the file and use Print → Save as PDF for a polished report.');
      setTimeout(() => setPdfDone(false), 3000);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          Export Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Scope</label>
          <Select value={exportType} onValueChange={(v: 'all' | 'exam') => setExportType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Progress</SelectItem>
              <SelectItem value="exam">Specific Exam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {exportType === 'exam' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Exam</label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* PDF as primary action */}
          <Button
            onClick={handleExportPDF}
            disabled={isExportingPDF || isDisabled}
            className="w-full"
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : pdfDone ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            {isExportingPDF ? 'Generating...' : pdfDone ? 'Downloaded!' : 'Download PDF Report'}
          </Button>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExportingCSV || isDisabled}
            className="w-full"
          >
            {isExportingCSV ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            Export CSV Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
