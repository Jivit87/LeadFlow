import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { UserPlus, Zap, Upload, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const EventSimulator = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [eventType, setEventType] = useState('page_view');

  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
      if (res.data.length > 0 && !selectedLead) {
        setSelectedLead(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/leads', { name: newLeadName, email: newLeadEmail });
      toast({
        variant: "success",
        title: "Success",
        description: "Lead created successfully!",
      });
      setNewLeadName('');
      setNewLeadEmail('');
      await fetchLeads();
    } catch {
      toast({
          variant: "destructive",
          title: "Error",
          description: "Could not create lead. Email might be duplicate."
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendEvent = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSending(true);

    try {
      await api.post('/events', {
        leadId: selectedLead,
        type: eventType,
        metadata: { source: 'simulator' },
        timestamp: new Date().toISOString(),
      });
      toast({
          variant: "success",
          title: "Event Sent",
          description: `'${eventType.replace(/_/g, ' ')}' event processed.`,
      });
    } catch {
      toast({
          variant: "destructive",
          title: "Failed to send event",
          description: "Please try again later."
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleBatchUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.file.files[0]);

    try {
        const res = await api.post('/events/batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
            variant: res.data.errors.length > 0 ? "default" : "success",
            title: "Batch Processing Complete",
            description: `Processed ${res.data.processed} events. ${res.data.errors.length} errors.`,
        });
    } catch {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not process CSV file."
        });
    } finally {
        setIsUploading(false);
        e.target.reset();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-2 sm:px-4 animate-in fade-in duration-500">
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Event Simulator
        </h1>
        <p className="text-muted-foreground">
            Generate synthetic data to test the scoring engine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Create Lead */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Create New Lead</CardTitle>
                        <CardDescription>Register a new prospect in the system</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                        required
                        disabled={isCreating}
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="e.g. Alice Smith"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        type="email"
                        required
                        disabled={isCreating}
                        value={newLeadEmail}
                        onChange={(e) => setNewLeadEmail(e.target.value)}
                        placeholder="alice@example.com"
                    />
                </div>
                </div>
                <Button type="submit" disabled={isCreating} className="w-full sm:w-auto min-w-[120px]">
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isCreating ? 'Creating...' : 'Create Lead'}
                </Button>
            </form>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trigger Event */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-600">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Trigger Event</CardTitle>
                            <CardDescription>Simulate user interactions</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                <form onSubmit={handleSendEvent} className="space-y-6 h-full flex flex-col">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Select Lead</label>
                        <Select
                            value={selectedLead}
                            onChange={(e) => setSelectedLead(e.target.value)}
                            className="h-10"
                            disabled={leads.length === 0}
                        >
                            {leads.map((l) => (
                            <option key={l._id} value={l._id}>
                                {l.name}
                            </option>
                            ))}
                            {leads.length === 0 && <option>No leads available</option>}
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {['email_open', 'page_view', 'form_submission', 'demo_request', 'purchase'].map((type) => (
                            <Button
                            key={type}
                            type="button"
                            variant={eventType === type ? 'default' : 'outline'}
                            onClick={() => setEventType(type)}
                            className="h-8 text-[10px] sm:text-xs capitalize px-2"
                            >
                            {type.replace('_', ' ')}
                            </Button>
                        ))}
                    </div>

                    <div className="mt-auto pt-4">
                        <Button
                        type="submit"
                        disabled={leads.length === 0 || isSending}
                        className="w-full"
                        >
                        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                        {isSending ? 'Sending...' : 'Send Event'}
                        </Button>
                    </div>
                </form>
                </CardContent>
            </Card>

            {/* Batch Upload */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Batch Upload</CardTitle>
                            <CardDescription>Process CSV files</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                <form
                    onSubmit={handleBatchUpload}
                    className="space-y-4 h-full flex flex-col"
                >
                     <div className="rounded-lg border border-dashed p-8 text-center hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Upload a CSV file</p>
                            <p className="text-xs text-muted-foreground">leadId, type, timestamp</p>
                        </div>
                        <Input
                            type="file"
                            name="file"
                            accept=".csv"
                            required
                            className="mt-4 w-full max-w-xs"
                        />
                    </div>
                    
                    <div className="mt-auto">
                        <Button type="submit" disabled={isUploading} variant="secondary" className="w-full">
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isUploading ? 'Processing...' : 'Upload & Process'}
                        </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default EventSimulator;
