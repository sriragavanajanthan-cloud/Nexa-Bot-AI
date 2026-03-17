import { useState } from "react";
import { invokeLLM } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, Sparkles } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#22d3ee", "#4ade80", "#f59e0b", "#f43f5e", "#a78bfa", "#fb923c"];

export default function GraphingTool() {
  const [prompt, setPrompt] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [chartData, setChartData] = useState(null);
  const [chartTitle, setChartTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const result = await invokeLLM({
      prompt: `Generate chart data for: "${prompt}". Return a JSON with: { "title": "chart title", "data": [ { "name": "label", "value": number }, ... ] }. Return 5-8 data points.`,
      responseJsonSchema: { type: "object", properties: { title: { type: "string" }, data: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } } } }
    });
    if (result?.data) {
      setChartData(result.data);
      setChartTitle(result.title || prompt);
    }
    setLoading(false);
  };

  const renderChart = () => {
    if (!chartData) return null;
    if (chartType === "bar") return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" stroke="#666" tick={{ fill: "#aaa", fontSize: 11 }} />
        <YAxis stroke="#666" tick={{ fill: "#aaa", fontSize: 11 }} />
        <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }} />
        <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
    if (chartType === "line") return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" stroke="#666" tick={{ fill: "#aaa", fontSize: 11 }} />
        <YAxis stroke="#666" tick={{ fill: "#aaa", fontSize: 11 }} />
        <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }} />
        <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee" }} />
      </LineChart>
    );
    if (chartType === "pie") return (
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff" }} />
      </PieChart>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Graphing Tool</h2>
      </div>

      <div className="flex gap-2">
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-32 bg-[#1a1a1a] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="pie">Pie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe the data to chart, e.g. 'Monthly sales for 2024 for a tech startup'"
        className="bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[80px]"
      />

      <Button onClick={generate} disabled={loading || !prompt.trim()} className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
        <Sparkles className="w-4 h-4 mr-2" />
        {loading ? "Generating..." : "Generate Chart"}
      </Button>

      {chartData && !loading && (
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-white/60 text-sm text-center font-medium">{chartTitle}</p>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
