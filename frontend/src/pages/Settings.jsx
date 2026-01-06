import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';

const Settings = () => {
    const [rules, setRules] = useState([]);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await api.get('/rules');
            setRules(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (type, points) => {
        try {
            await api.put(`/rules/${type}`, { points: parseInt(points) });
            fetchRules();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your scoring logic.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Scoring Rules</CardTitle>
                    <CardDescription>Assign points for each event type.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rules.map((rule) => (
                        <div key={rule._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <div className="font-medium capitalize mb-1">
                                    {rule.event_type.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Current: {rule.points} pts
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    defaultValue={rule.points}
                                    onBlur={(e) => {
                                        if (parseInt(e.target.value) !== rule.points) {
                                            handleUpdate(rule.event_type, e.target.value);
                                        }
                                    }}
                                    className="w-24 text-right"
                                />
                                <span className="text-sm text-muted-foreground w-6">pts</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
