import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Copy, Check, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { calculateProgress } from '@/types';

const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

export function ShareProgress() {
  const { exams, getExamProgress, getOverallProgress, studyEntries } = useApp();
  const [shareType, setShareType] = useState<'overall' | 'exam'>('overall');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const overallProgress = getOverallProgress();
  const isDisabled = shareType === 'exam' && !selectedExamId;

  const generateShareText = () => {
    if (shareType === 'overall') {
      const totalCategories = exams.reduce((sum, e) => sum + e.categories.length, 0);
      const totalDays = new Set(studyEntries.map(e => e.date)).size;
      const studyLogs = studyEntries.filter(e => !e.marks);
      const testLogs = studyEntries.filter(e => e.marks);
      const avgScore = testLogs.length > 0
        ? Math.round(testLogs.reduce((sum, e) => sum + (e.marks!.obtained / e.marks!.total) * 100, 0) / testLogs.length)
        : null;
      
      let text = `📚 My TrackPrep Study Progress\n\n`;
      text += `🎯 Overall Progress: ${overallProgress}%\n`;
      text += `📖 Exams: ${exams.length}\n`;
      text += `📂 Categories: ${totalCategories}\n`;
      text += `📝 Study Sessions: ${studyLogs.length}\n`;
      text += `📊 Test Logs: ${testLogs.length}\n`;
      if (avgScore !== null) text += `🏆 Avg Test Score: ${avgScore}%\n`;
      text += `📅 Days Studied: ${totalDays}\n\n`;
      text += `#TrackPrep #StudyProgress #ExamPrep`;
      return text;
    } else if (selectedExam) {
      const examProgress = getExamProgress(selectedExam.id);
      const examEntries = studyEntries.filter(e => e.examId === selectedExam.id);
      const studyLogs = examEntries.filter(e => !e.marks);
      const testLogs = examEntries.filter(e => e.marks);
      const avgScore = testLogs.length > 0
        ? Math.round(testLogs.reduce((sum, e) => sum + (e.marks!.obtained / e.marks!.total) * 100, 0) / testLogs.length)
        : null;

      let text = `📚 ${selectedExam.name} - Study Progress\n\n`;
      text += `🎯 Progress: ${examProgress}%\n`;
      text += `📂 Categories: ${selectedExam.categories.length}\n`;
      text += `📝 Study Sessions: ${studyLogs.length}\n`;
      text += `📊 Test Logs: ${testLogs.length}\n`;
      if (avgScore !== null) text += `🏆 Avg Test Score: ${avgScore}%\n`;
      
      selectedExam.categories.forEach(cat => {
        const catProgress = calculateProgress(cat.completedValue, cat.targetValue);
        text += `  • ${cat.name}: ${catProgress}%\n`;
      });
      
      if (selectedExam.targetDate) {
        const daysLeft = Math.ceil((new Date(selectedExam.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        text += `\n📅 ${daysLeft > 0 ? `${daysLeft} days until exam` : 'Exam day!'}\n`;
      }
      
      text += `\n#TrackPrep #StudyProgress #${selectedExam.name.replace(/\s+/g, '')}`;
      return text;
    }
    return '';
  };

  const handleCopyText = async () => {
    const text = generateShareText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Progress summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Progress summary copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Could not copy text. Please try again.');
      }
      document.body.removeChild(textarea);
    }
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (!text) return;

    if (canNativeShare) {
      try {
        await navigator.share({ title: 'My TrackPrep Progress', text });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled — not an error
        if ((error as Error).name === 'AbortError') return;
        // Share failed — fall back to copy
        toast.info('Share not available, copying to clipboard instead.');
        handleCopyText();
      }
    } else {
      // No native share — just copy
      handleCopyText();
    }
  };

  const handleDownloadCard = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const progress = shareType === 'overall' ? overallProgress : (selectedExam ? getExamProgress(selectedExam.id) : 0);
      const title = shareType === 'overall' ? 'My Study Progress' : (selectedExam?.name || 'Exam Progress');
      const examData = shareType === 'overall'
        ? exams.slice(0, 6).map(e => ({ name: e.name, progress: getExamProgress(e.id) }))
        : (selectedExam?.categories.slice(0, 6).map(c => ({
            name: c.name,
            progress: calculateProgress(c.completedValue, c.targetValue)
          })) || []);

      const cardHtml = generateCardHTML(title, progress, examData);
      const blob = new Blob([cardHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackprep-card-${new Date().toISOString().split('T')[0]}.html`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      toast.success('Progress card downloaded!');
    } catch {
      toast.error('Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Share2 className="w-4 h-4 text-primary" />
          Share Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Share Type</label>
          <Select value={shareType} onValueChange={(v: 'overall' | 'exam') => setShareType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Progress</SelectItem>
              <SelectItem value="exam">Specific Exam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {shareType === 'exam' && (
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

        {/* Preview card */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              T
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {shareType === 'overall' ? 'My Study Progress' : (selectedExam?.name || 'Select an exam')}
              </p>
              <p className="text-xs text-muted-foreground">TrackPrep</p>
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-primary">
              {shareType === 'overall' ? overallProgress : (selectedExam ? getExamProgress(selectedExam.id) : 0)}%
            </p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyText}
              disabled={isDisabled}
              className="w-full"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-success" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            {canNativeShare ? (
              <Button
                onClick={handleShare}
                disabled={isDisabled}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleDownloadCard}
                disabled={isGenerating || isDisabled}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Card
              </Button>
            )}
          </div>
          {canNativeShare && (
            <Button
              variant="outline"
              onClick={handleDownloadCard}
              disabled={isGenerating || isDisabled}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Progress Card
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function generateCardHTML(title: string, progress: number, items: { name: string; progress: number }[]) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TrackPrep Progress Card</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
    .card { background: linear-gradient(145deg, #0f1629, #1a2342); border-radius: 20px; padding: 30px; max-width: 400px; width: 100%; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .logo { width: 40px; height: 40px; background: linear-gradient(135deg, #00c6ff, #0072ff); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
    .title { font-size: 20px; font-weight: 600; }
    .subtitle { font-size: 12px; color: rgba(255,255,255,0.6); }
    .progress-ring { display: flex; justify-content: center; margin: 30px 0; }
    .progress-circle { width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#00c6ff ${progress * 3.6}deg, rgba(255,255,255,0.1) ${progress * 3.6}deg); display: flex; align-items: center; justify-content: center; }
    .progress-inner { width: 120px; height: 120px; background: #0f1629; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .progress-value { font-size: 36px; font-weight: 700; background: linear-gradient(135deg, #00c6ff, #0072ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .progress-label { font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
    .items { margin-top: 20px; }
    .item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .item:last-child { border-bottom: none; }
    .item-name { font-size: 14px; color: rgba(255,255,255,0.8); }
    .item-progress { font-size: 14px; font-weight: 600; color: #00c6ff; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 12px; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">T</div>
      <div>
        <div class="title">${title}</div>
        <div class="subtitle">TrackPrep • ${new Date().toLocaleDateString()}</div>
      </div>
    </div>
    <div class="progress-ring">
      <div class="progress-circle">
        <div class="progress-inner">
          <span class="progress-value">${progress}%</span>
          <span class="progress-label">Complete</span>
        </div>
      </div>
    </div>
    <div class="items">
      ${items.map(i => `<div class="item"><span class="item-name">${i.name}</span><span class="item-progress">${i.progress}%</span></div>`).join('')}
    </div>
    <div class="footer">Generated with TrackPrep</div>
  </div>
</body>
</html>`;
}
