import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { socket } from '../services/socket';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';

const LeadDetails = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchLeadData();
    socket.on('score_update', handleUpdate);
    return () => socket.off('score_update', handleUpdate);
  }, [id]);

  const fetchLeadData = async () => {
    try {
      const [leadRes, historyRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/history`)
      ]);
      setLead(leadRes.data);
      setHistory(historyRes.data);
      prepareChartData(historyRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const prepareChartData = (historyData) => {
    const data = [...historyData].reverse().map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: h.newScore,
      fullDate: new Date(h.timestamp).toLocaleString()
    }));
    setChartData(data);
  };

  const handleUpdate = (data) => {
    if (data.leadId === id) {
      fetchLeadData();
    }
    // Also update history if needed via re-fetch or optimistically
  };

  if (!lead) return <div className="p-8 text-center text-muted-foreground">Loading lead details...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4">
        <Link to="/" className="w-fit">
            <Button variant="outline" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card p-6 rounded-lg border shadow-sm">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">{lead.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-muted-foreground">{lead.email}</p>
                    <span className="hidden md:inline text-muted-foreground">•</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border">
                        ID: {lead._id.slice(-6)}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border">
                <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Current Score</p>
                    <p className="text-3xl font-bold tracking-tight text-primary">{lead.score}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Trend Chart - Takes up 2 cols on lg */}
        <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle>Score History</CardTitle>
                <CardDescription>Visualizing engagement over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                        dataKey="time" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        width={40}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))', 
                            borderColor: 'hsl(var(--border))', 
                            borderRadius: 'var(--radius)',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }}
                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }} 
                        activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }} 
                    />
                </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* History Timeline */}
        <Card className="shadow-sm flex flex-col h-[450px] lg:h-auto">
            <CardHeader className="pb-3 border-b">
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent events</CardDescription>
            </CardHeader>
             <CardContent className="flex-1 overflow-auto p-0">
                <div className="flex flex-col">
                {history.map((record, i) => (
                    <div key={record._id} className="flex gap-3 p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col items-center mt-1">
                             <div className={`h-2 w-2 rounded-full ${record.scoreChange > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                             {i !== history.length - 1 && <div className="w-[1px] h-full bg-border mt-2"></div>}
                        </div>
                        <div className="flex-1 space-y-1">
                             <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-foreground">
                                    {record.reason.replace(/_/g, ' ')}
                                </span>
                                <span className={record.scoreChange >= 0 ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'}>
                                    {record.scoreChange > 0 ? '+' : ''}{record.scoreChange}
                                </span>
                             </div>
                             <div className="text-xs text-muted-foreground">
                                {new Date(record.timestamp).toLocaleString()}
                             </div>
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No activity recorded yet.
                    </div>
                )}
                </div>
             </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LeadDetails;
