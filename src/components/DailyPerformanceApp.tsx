import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// データ型の定義
type ScoreEntry = {
  date: string;
  score: number;
};

const DailyPerformanceApp = () => {
  // ステート管理
  const [score, setScore] = useState<number>(50);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // localStorage からデータを読み込む
  useEffect(() => {
    const storedData = localStorage.getItem('dailyPerformanceData');
    if (storedData) {
      try {
        setEntries(JSON.parse(storedData));
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        setStatusMessage('保存データの読み込みに失敗しました');
      }
    }
  }, []);

  // 現在の日付を YYYY-MM-DD 形式で取得
  const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // スコアを保存する
  const saveScore = () => {
    const currentDate = getCurrentDate();
    
    // 既存のエントリを確認し、同じ日付があれば更新
    const existingEntryIndex = entries.findIndex(entry => entry.date === currentDate);
    
    let newEntries: ScoreEntry[];
    if (existingEntryIndex >= 0) {
      // 既存のエントリを更新
      newEntries = [...entries];
      newEntries[existingEntryIndex] = { date: currentDate, score };
      setStatusMessage('今日のスコアを更新しました');
    } else {
      // 新しいエントリを追加
      newEntries = [...entries, { date: currentDate, score }];
      setStatusMessage('今日のスコアを保存しました');
    }
    
    // 日付でソート
    newEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // ステートとlocalStorageを更新
    setEntries(newEntries);
    localStorage.setItem('dailyPerformanceData', JSON.stringify(newEntries));
  };

  // JSONデータをエクスポート
  const exportData = () => {
    if (entries.length === 0) {
      setStatusMessage('エクスポートするデータがありません');
      return;
    }
    
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'daily_performance.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatusMessage('データをエクスポートしました');
  };

  // 入力値をハンドリング
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value, 10);
    setScore(newScore);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">俺の日々の出来グラフ</h1>
      
      {/* スコア入力セクション */}
      <div className="w-full bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="score" className="mr-2 text-gray-700">今日のスコア:</label>
            <input
              type="range"
              id="score"
              min="0"
              max="100"
              value={score}
              onChange={handleScoreChange}
              className="w-32"
            />
            <span className="ml-2 font-bold text-lg">{score}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveScore}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              エクスポート
            </button>
          </div>
        </div>
        {statusMessage && (
          <div className="mt-2 text-sm text-green-600">{statusMessage}</div>
        )}
      </div>
      
      {/* グラフ表示セクション */}
      <div className="w-full bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">パフォーマンス推移</h2>
        {entries.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            まだデータがありません。スコアを入力して保存してください。
          </div>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={entries}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="スコア"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* データ一覧 */}
      {entries.length > 0 && (
        <div className="w-full bg-white p-4 rounded-lg shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">記録一覧</h2>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">日付</th>
                  <th className="py-2 px-4 text-right">スコア</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{entry.date}</td>
                    <td className="py-2 px-4 text-right font-semibold">{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPerformanceApp;