import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { socket } from '../services/socket';
import { TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    socket.on('score_update', handleScoreUpdate);
    return () => {
      socket.off('score_update', handleScoreUpdate);
    };
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleScoreUpdate = (data) => {
    setLeads(currentLeads => {
      const updated = currentLeads.map(lead => {
        if (lead._id === data.leadId) {
          return { ...lead, score: data.newScore };
        }
        return lead;
      });
      return updated.sort((a, b) => b.score - a.score);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Lead Leaderboard</h1>
        <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-muted-foreground">Live Updates Active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in system
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/5 border-b">
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead className="min-w-[150px]">Lead Name</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[200px]">Email</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
                    <TableHead className="text-right w-[80px]">View</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {leads.map((lead, index) => (
                    <TableRow 
                        key={lead._id}
                        onClick={() => navigate(`/leads/${lead._id}`)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                    <TableCell className="text-center">
                        <span className={`
                            inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                            ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                            index === 1 ? 'bg-slate-300 text-slate-800' :
                            index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-500'}
                        `}>
                            {index + 1}
                        </span>
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                    <TableCell className="text-right">
                        <span className="font-mono font-bold tracking-tight">{lead.score}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground border">
                            {lead.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                {leads.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No leads found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
