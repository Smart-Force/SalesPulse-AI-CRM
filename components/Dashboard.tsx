import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Users, LineChart, Handshake, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

const pipelineData = [
  { name: 'New', value: 400 },
  { name: 'Contacted', value: 300 },
  { name: 'Engaged', value: 200 },
  { name: 'Meeting', value: 278 },
  { name: 'Won', value: 189 },
];

const leadSourceData = [
  { name: 'Apollo.io', value: 400 },
  { name: 'Lusha', value: 300 },
  { name: 'Hunter.io', value: 300 },
  { name: 'Manual', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MetricCard = ({ title, value, change, changeType, icon: Icon, iconBgColor }: { title: string, value: string, change: string, changeType: 'up' | 'down', icon: React.ElementType, iconBgColor: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</CardTitle>
      <div className={`p-2 rounded-full ${iconBgColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
      <p className={`text-sm mt-2 ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {changeType === 'up' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />}
        {change} from last month
      </p>
    </CardContent>
  </Card>
);


export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">Welcome back! Here's what's happening with your sales today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Leads" value="1,284" change="12%" changeType="up" icon={Users} iconBgColor="bg-blue-500" />
        <MetricCard title="Conversion Rate" value="24.8%" change="3.2%" changeType="up" icon={LineChart} iconBgColor="bg-green-500" />
        <MetricCard title="Active Deals" value="48" change="5" changeType="down" icon={Handshake} iconBgColor="bg-purple-500" />
        <MetricCard title="Revenue" value="$124,500" change="18%" changeType="up" icon={DollarSign} iconBgColor="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.3)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Leads in Stage" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="#6b7280" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#6b7280' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};